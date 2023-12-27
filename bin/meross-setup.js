#!/usr/bin/env node --no-warnings

'use strict';

import pkg from '../package.json' assert { type: 'json' };
import { program } from 'commander';
import TerminalKit from 'terminal-kit';
const { terminal } = TerminalKit;

import { HTTPTransport } from '../src/transport.js';
import { Device } from '../src/device.js';
import { WifiAccessPoint } from '../src/wifi.js';
import { progressFunctionWithMessage } from '../src/cli.js';

const collection = (value, store = []) => {
  store.push(value);
  return store;
};

const numberInRange = (min, max) => (value) => {
  if (value < min || value > max) {
    throw new program.InvalidOptionArgumentError(
      `Value is out of range (${min}-${max})`
    );
  }
  return parseInt(value);
};

const parseIntWithValidation = (value) => {
  const i = parseInt(value);
  if (isNaN(i)) {
    throw new program.InvalidOptionArgumentError(`Value should be an integer`);
  }

  return i;
};

program
  .version(pkg.version)
  .arguments('<options>')
  .requiredOption(
    '-a, --ip <ip>',
    'Send command to device with this IP address',
    '10.10.10.1'
  )
  .option('--wifi-ssid <wifi-ssid>', 'WIFI AP name')
  .option('--wifi-pass <wifi-pass>', 'WIFI AP password')
  .option(
    '--wifi-encryption <wifi-encryption>',
    'WIFI AP encryption(this can be found using meross info --include-wifi)',
    parseIntWithValidation
  )
  .option(
    '--wifi-cipher <wifi-cipher>',
    'WIFI AP cipher (this can be found using meross info --include-wifi)',
    parseIntWithValidation
  )
  .option(
    '--wifi-bssid <wifi-bssid>',
    'WIFI AP BSSID (each octet seperated by a colon `:`)'
  )
  .option(
    '--wifi-channel <wifi-channel>',
    'WIFI AP 2.5GHz channel number [1-13] (this can be found using meross info --include-wifi)',
    numberInRange(1, 13)
  )
  .option('--mqtt <mqtt-server>', 'MQTT server address', collection)
  .option(
    '-u, --user <user-id>',
    'Integer id. Only useful for connecting to Meross Cloud.',
    parseIntWithValidation,
    0
  )
  .option('-k, --key <shared-key>', 'Shared key for generating signatures', '')
  .option('-t, --set-time', 'Configure device time with time and timezone of current host')
  .option('-v, --verbose', 'Show debugging messages', '')
  .parse(process.argv);

const options = program.opts();

const ip = options.ip;
const key = options.key;
const userId = options.user;
const verbose = options.verbose;

try {
  const transport = new HTTPTransport({ ip });
  const device = new Device({
    transport, credentials: {
      userId,
      key
    }
  });

  const { setTime = false } = options;
  if (setTime) {
    await progressFunctionWithMessage(() => {
      return device.configureSystemTime();
    }, 'Comfiguring device time');
  }

  const { mqtt = [] } = options;
  if (mqtt.length) {
    await progressFunctionWithMessage(() => {
      return device.configureMQTTBrokers({
        mqtt,
      });
    }, 'Configuring MQTT brokers');
  }

  if (options.wifiSsid || options.wifiBssid) {
    const wifiAccessPoint = new WifiAccessPoint({
      ssid: options.wifiSsid,
      password: options.wifiPass,
      channel: options.wifiChannel,
      encryption: options.wifiEncryption,
      cipher: options.wifiCipher,
      bssid: options.wifiBssid,
    });
    let success = await progressFunctionWithMessage(() => {
      return device.configureWifi({
        wifiAccessPoint,
      });
    }, 'Configuring WIFI');

    if (success) {
      terminal.yellow(`Device will now reboot…\n`);
    }
  }
} catch (error) {
  terminal.red(error.message);
}
