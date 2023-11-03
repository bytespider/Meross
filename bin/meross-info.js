#!/usr/bin/env node --no-warnings

'use strict';

import pkg from '../package.json' assert { type: 'json' };
import { program } from 'commander';
import TerminalKit from 'terminal-kit';
const terminal = TerminalKit.terminal;

import { printDeviceTable, printWifiListTable } from '../src/cli.js';
import { Device } from '../src/device.js';
import { HTTPTransport } from '../src/transport.js';

program
  .version(pkg.version)
  .arguments('<options>')
  .requiredOption(
    '-a, --ip <ip>',
    'Send command to device with this IP address',
    '10.10.10.1'
  )
  .option(
    '-u, --user <user-id>',
    'Integer id. Only useful for connecting to Meross Cloud.',
    parseInt
  )
  .option('-k, --key <shared-key>', 'Shared key for generating signatures', '')
  .option('--include-wifi', 'List WIFI access points near the device')
  .option('--include-ability', 'List device ability list')
  .option('--include-time', 'List device time')
  .option('-v, --verbose', 'Show debugging messages')
  .parse(process.argv);

const options = program.opts();

const ip = options.ip;
const key = options.key;
const userId = options.userId;
const includeWifiList = options.includeWifi;
const includeAbilityList = options.includeAbility;
const includeTime = options.includeTime;
const verbose = options.verbose;

console.log(`Getting info about device with IP ${ip}`);

let spinner;
try {
  const transport = new HTTPTransport({ ip });
  const device = new Device({ transport });

  console.log(await device.queryCustom('Appliance.Config.Trace'));
  process.exit();

  const deviceInformation = await device.querySystemInformation();

  let deviceAbility;
  if (includeAbilityList) {
    deviceAbility = await device.querySystemAbility();
  }

  let deviceTime;
  if (includeTime) {
    deviceTime = await device.querySystemTime();
  }

  await printDeviceTable(deviceInformation, deviceAbility, deviceTime);

  if (includeWifiList) {
    spinner = await terminal.spinner({
      animation: 'dotSpinner',
      rightPadding: ' ',
      attr: { color: 'cyan' },
    });
    terminal('Getting WIFI list…\n');

    const wifiList = await device.queryNearbyWifi();

    await printWifiListTable(wifiList);
  }
} catch (error) {
  terminal.red(error.message);
} finally {
  if (spinner) {
    spinner.animate(false);
  }
}
