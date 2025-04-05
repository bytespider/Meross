#!/usr/bin/env node

'use strict';

import pkg from '../package.json' with { type: 'json' };
import { program, InvalidOptionArgumentError } from 'commander';
import TerminalKit from 'terminal-kit';
const { terminal } = TerminalKit;

import { HTTPTransport, Device, WifiAccessPoint, CloudCredentials, Namespace } from '@meross/lib';;
import { progressFunctionWithMessage } from './cli.js';
import { generateTimestamp, computePresharedPrivateKey} from '@meross/lib/utils';
import { generateKeyPair } from '@meross/lib/encryption';

type Options = {
  ip: string;
  wifiSsid?: string;
  wifiPass?: string;
  wifiEncryption?: number;
  wifiCipher?: number;
  wifiBssid?: string;
  wifiChannel?: number;
  mqtt?: string[];
  user: number;
  key: string;
  privateKey: string | boolean;
  setTime: boolean;
  verbose: boolean;
  quiet: boolean;
};

const collection = (value: string, store: string[] = []) => {
  store.push(value);
  return store;
};

const numberInRange = (min: number, max: number) => (value: string) => {
  if (Number(value) < min || Number(value) > max) {
    throw new InvalidOptionArgumentError(
      `Value is out of range (${min}-${max})`
    );
  }
  return parseInt(value);
};

const parseIntWithValidation = (value: string) => {
  const i = parseInt(value);
  if (isNaN(i)) {
    throw new InvalidOptionArgumentError(`Value should be an integer`);
  }

  return i;
};

program
  .version(pkg.version)
  .arguments('[options]')
  .requiredOption(
    '-a, --ip <ip>',
    'Send command to device with this IP address',
    '10.10.10.1'
  )
  .option('--wifi-ssid <wifi-ssid>', 'WIFI Access Point name')
  .option('--wifi-pass <wifi-pass>', 'WIFI Access Point password')
  .option(
    '--wifi-encryption <wifi-encryption>',
    'WIFI Access Point encryption (this can be found using meross info --include-wifi)',
    parseIntWithValidation
  )
  .option(
    '--wifi-cipher <wifi-cipher>',
    'WIFI Access Point cipher (this can be found using meross info --include-wifi)',
    parseIntWithValidation
  )
  .option(
    '--wifi-bssid <wifi-bssid>',
    'WIFI Access Point BSSID (each octet seperated by a colon `:`)'
  )
  .option(
    '--wifi-channel <wifi-channel>',
    'WIFI Access Point 2.4GHz channel number [1-13] (this can be found using meross info --include-wifi)',
    numberInRange(1, 13)
  )
  .option('--mqtt <mqtt-server>', 'MQTT server address', collection)
  .option(
    '-u, --user <user-id>',
    'Integer id. Used by devices connected to the Meross Cloud',
    parseIntWithValidation,
    0
  )
  .option(
    '-k, --key <shared-key>', 
    'Shared key for generating signatures', 
    'meross'
  )
  .option('--private-key [private-key]', `Private key for ECDH key exchange. If not provided a new one will be generated`)
  .option('-t, --set-time', 'Configure device time with time and timezone of current host')
  .option('-q, --quiet', 'Suppress all output', false)

  .parse(process.argv);

export const options = program.opts<Options>();

const { ip, user: userId, key } = options;
const { quiet, verbose } = options;

const { wifiSsid: ssid, wifiBssid: bssid, wifiPass: password, wifiChannel: channel, wifiEncryption: encryption, wifiCipher: cipher } = options;
if (ssid !== undefined && (ssid?.length < 1 || ssid?.length > 32)) {
  terminal.red(`WIFI SSID length must be between 1 and 32 characters\n`);
  process.exit(1);
}

if (bssid && (bssid.length < 1 || bssid.length > 17)) {
  terminal.red(`WIFI BSSID length must be between 1 and 17 characters\n`);
  process.exit(1);
}

if (password !== undefined && (password?.length < 8 || password?.length > 64)) {
  terminal.red(`WIFI password length must be between 8 and 64 characters\n`);
  process.exit(1);
}

try {
  const credentials = new CloudCredentials(userId, key);

  const transport = new HTTPTransport({ url: `http://${ip}/config`, credentials });
  const device = new Device();

  device.setTransport(transport);

  // fetch device information
  const fetchDeviceInfo = async () => {
    const { system: { hardware, firmware } } = await device.fetchDeviceInfo();
    terminal.green(`${hardware.type} (hardware: ${hardware.version}, firmware: ${firmware.version})`);
  };
  await (quiet ? device.fetchDeviceInfo() : progressFunctionWithMessage(fetchDeviceInfo, 'Fetching device information'));
  
  // fetch device abilities
  const fetchDeviceAbilities = () => device.fetchDeviceAbilities();
  await (quiet ? fetchDeviceAbilities() : progressFunctionWithMessage(fetchDeviceAbilities, 'Fetching device abilities'));

  // check if we neet to exchange public keys
  if (device.hasAbility(Namespace.ENCRYPT_ECDHE) && !device.encryptionKeys.sharedKey) {
    let { privateKey } = options;
    
    if (privateKey === true) {
      const { privateKey: generatedPrivateKey } = await generateKeyPair();
      privateKey = generatedPrivateKey.toString('base64');
    }

    if (!privateKey) {
      // use precomputed private key
      privateKey = computePresharedPrivateKey(
        device.id,
        key,
        device.hardware.macAddress
      );
    }

    await device.setPrivateKey(Buffer.from(privateKey, 'base64'));

    const exchangeKeys = () => device.exchangeKeys();
    await (quiet ? exchangeKeys() : progressFunctionWithMessage(exchangeKeys, 'Exchanging public keys'));
  }

  const { setTime = false } = options;
  if (setTime) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const time = generateTimestamp();

    const configureDeviceTime = () => device.configureDeviceTime(time, timezone);
    await (quiet ? configureDeviceTime() : progressFunctionWithMessage(configureDeviceTime, 'Configuring device time'));
  }

  const { mqtt = [] } = options;
  if (mqtt.length) {
    const configureMQTT = () => device.configureMQTTBrokersAndCredentials(mqtt, credentials);
    await (quiet ? configureMQTT() : progressFunctionWithMessage(configureMQTT, 'Configuring MQTT brokers'));
  }

  if (ssid || bssid) {
    const wifiAccessPoint = new WifiAccessPoint({
      ssid,
      password,
      channel,
      encryption,
      cipher,
      bssid,
    });
    const configureWifi = () => device.configureWifi(wifiAccessPoint);
    const success = await (quiet ? configureWifi() : progressFunctionWithMessage(configureWifi, 'Configuring WIFI'));

    if (success && !quiet) {
      terminal.yellow(`Device will now reboot…\n`);
    }
  }
} catch (error: any) {
  terminal.red(`${error.message}\n`);
  if (process.env.LOG_LEVEL) {
    terminal.red('Error stack:\n');
    terminal.red(error.stack);
  }
  process.exit(1);
}
