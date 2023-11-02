#!/usr/bin/env node --no-warnings

'use strict';

import pkg from '../package.json' assert { type: 'json' };
import { program } from 'commander';
import TerminalKit from 'terminal-kit';
const terminal = TerminalKit.terminal;

import { HTTPTransport } from '../src/transport.js';
import { Device } from '../src/device.js';
import { WifiAccessPoint } from '../src/wifi.js';

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
  .option('-v, --verbose', 'Show debugging messages', '')
  .parse(process.argv);

const options = program.opts();

const ip = options.ip;
const key = options.key;
const userId = options.user;
const verbose = options.verbose;

let spinner;
try {
  spinner = await terminal.spinner({
    animation: 'dotSpinner',
    rightPadding: ' ',
    attr: { color: 'cyan' },
  });

  const transport = new HTTPTransport({ ip });
  const device = new Device({ transport });

  await device.setSystemTime();
  terminal('• Configured Device time.\n');

  const { mqtt = [] } = options;
  if (mqtt.length) {
    await device.configureMQTTBrokers({
      mqtt,
    });
    terminal('• Configured MQTT brokers.\n');
  }

  if (options.wifiSsid && options.wifiPass) {
    const wifiAccessPoint = new WifiAccessPoint({
      ssid: options.wifiSsid,
      password: options.wifiPass,
      channel: options.wifiChannel,
      encryption: options.wifiEncryption,
      cipher: options.wifiCipher,
      bssid: options.wifiBssid,
    });
    await device.configureWifi({
      wifiAccessPoint,
    });

    terminal('• Configured WIFI.\n');
    terminal.green(`Device will now reboot...\n`);
  }
} catch (error) {
  terminal.red(error.message);
} finally {
  if (spinner) {
    spinner.animate(false);
  }
}
