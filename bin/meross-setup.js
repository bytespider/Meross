#!/usr/bin/env node --no-warnings

'use strict'

import pkg from '../package.json' assert { type: 'json' };
import { program } from 'commander';

import { configureMqttServers, configureWifiCredentials } from '../src/api.js'

const collection = (value, store = []) => {
    store.push(value)
    return store
}

const numberInRange = (min, max) => (value) => {
    if (value < min || value > max) {
        throw new program.InvalidOptionArgumentError(`Value is out of range (${min}-${max})`);
    }
    return parseInt(value);
}

const parseIntWithValidation = (value) => {
    const i = parseInt(value);
    if (isNaN(i)) {
        throw new program.InvalidOptionArgumentError(`Value should be an integer`);
    }

    return i;
}

program
    .version(pkg.version)
    .arguments('<options>')
    .requiredOption('-g, --gateway <gateway>', 'Set the gateway address', '10.10.10.1')
    .requiredOption('--wifi-ssid <wifi-ssid>', 'WIFI AP name')
    .requiredOption('--wifi-pass <wifi-pass>', 'WIFI AP password')
    .option('--wifi-encryption <wifi-encryption>', 'WIFI AP encryption(this can be found using meross info --include-wifi)', parseIntWithValidation)
    .option('--wifi-cipher <wifi-cipher>', 'WIFI AP cipher (this can be found using meross info --include-wifi)', parseIntWithValidation)
    .option('--wifi-bssid <wifi-bssid>', 'WIFI AP BSSID (each octet seperated by a colon `:`)')
    .option('--wifi-channel <wifi-channel>', 'WIFI AP 2.5GHz channel number [1-13] (this can be found using meross info --include-wifi)', numberInRange(1, 13))
    .option('--mqtt <mqtt-server>', 'MQTT server address', collection)
    .option('-u, --user <user-id>', 'Integer id. Only useful for connecting to Meross Cloud.', parseIntWithValidation, 0)
    .option('-k, --key <shared-key>', 'Shared key for generating signatures', '')
    .option('-s, --secure-credentials', 'Send WIFI credentials to the device securely. ONLY Firmware >= 6s')
    .option('-v, --verbose', 'Show debugging messages', '')
    .parse(process.argv)

const options = program.opts();

(async () => {
    const gateway = options.gateway
    const key = options.key
    const userId = options.user
    const verbose = options.verbose

    if (options.mqtt && options.mqtt.length) {
        await configureMqttServers({
            key,
            ip: gateway,
            mqtt: options.mqtt
        });
    }

    await configureWifiCredentials({
        key,
        ip: gateway,
        credentials: {
            ssid: options.wifiSsid,
            password: options.wifiPass,
            channel: options.wifiChannel,
            encryption: options.wifiEncryption,
            cipher: options.wifiCipher,
            bssid: options.wifiBssid,
        }
    });
    console.log(`Device will reboot...`)
})()
