#!/usr/bin/env node --no-warnings

'use strict'

import pkg from '../package.json' assert { type: 'json' };
import { program } from 'commander';

import { queryDeviceInformation, queryDeviceWifiList } from '../src/api.js';

program
    .version(pkg.version)
    .arguments('<options>')
    .requiredOption('-g, --gateway <gateway-ip>', 'Set the gateway address', '10.10.10.1')
    .option('-u, --user <user-id>', 'Integer id. Only useful for connecting to Meross Cloud.', parseInt)
    .option('-k, --key <shared-key>', 'Shared key for generating signatures', '')
    .option('-l, --include-wifi', 'List WIFI access points near the device')
    .option('-v, --verbose', 'Show debugging messages')
    .parse(process.argv)

const options = program.opts();

const gateway = options.gateway
const key = options.key
const includeWifiList = options.includeWifi
const verbose = options.verbose

console.log(`Getting info about device with IP ${gateway}`)
const deviceInformation = await queryDeviceInformation({
    key,
    ip: gateway,
});
/** @todo make this a pretty display */
console.log(deviceInformation);

if (includeWifiList) {
    const wifiList = await queryDeviceWifiList({
        key,
        ip: gateway
    });
    /** @todo make this a pretty display */
    console.log(wifiList);
}
