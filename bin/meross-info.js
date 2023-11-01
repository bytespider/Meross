#!/usr/bin/env node --no-warnings

'use strict'

import pkg from '../package.json' assert { type: 'json' };
import { program } from 'commander';
import TerminalKit from 'terminal-kit';
const terminal = TerminalKit.terminal;

import { queryDeviceAbility, queryDeviceTime, queryDeviceInformation, queryDeviceWifiList } from '../src/api.js';
import { HTTP } from "../src/http.js";
import { printDeviceTable, printWifiListTable } from '../src/cli.js';

program
    .version(pkg.version)
    .arguments('<options>')
    .requiredOption('-a, --ip <ip>', 'Send command to device with this IP address', '10.10.10.1')
    .option('-u, --user <user-id>', 'Integer id. Only useful for connecting to Meross Cloud.', parseInt)
    .option('-k, --key <shared-key>', 'Shared key for generating signatures', '')
    .option('--include-wifi', 'List WIFI access points near the device')
    .option('--include-ability', 'List device ability list')
    .option('--include-time', 'List device time')
    .option('-v, --verbose', 'Show debugging messages')
    .parse(process.argv)

const options = program.opts();

const ip = options.ip;
const key = options.key;
const userId = options.userId;
const includeWifiList = options.includeWifi;
const includeAbilityList = options.includeAbility;
const includeTime = options.includeTime;
const verbose = options.verbose;

console.log(`Getting info about device with IP ${ip}`)

try {
    const http = new HTTP(ip);

    const deviceInformation = await queryDeviceInformation({ http });

    let deviceAbility;
    if (includeAbilityList) {
        deviceAbility = await queryDeviceAbility({ http });
    }

    let deviceTime;
    if (includeTime) {
        deviceTime = await queryDeviceTime({ http });
    }

    await printDeviceTable(deviceInformation, deviceAbility, deviceTime);

    if (includeWifiList) {
        let spinner = await terminal.spinner({ animation: 'dotSpinner', rightPadding: ' ' })
        terminal('Getting WIFI list…\n')

        const wifiList = await queryDeviceWifiList({ http });

        spinner.animate(false);
        terminal.move(0, -1);

        await printWifiListTable(wifiList);
    }
} catch (error) {
    terminal.red(error.message);
}