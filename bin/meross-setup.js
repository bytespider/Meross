#!/usr/bin/env node --no-warnings

'use strict'

import pkg from '../package.json' assert { type: 'json' };
import { program } from 'commander';
import TerminalKit from 'terminal-kit';
const terminal = TerminalKit.terminal;

import { configureDeviceTime, configureMqttBrokers, configureWifiParameters, queryDeviceAbility, queryDeviceInformation } from '../src/api.js'
import { Namespace } from '../src/header.js';
import { HTTP } from '../src/http.js';
import { SecureWifiCredentials, WifiCredentials } from '../src/wifiCredentials.js';

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
    .requiredOption('-a, --ip <ip>', 'Send command to device with this IP address', '10.10.10.1')
    .option('--wifi-ssid <wifi-ssid>', 'WIFI AP name')
    .option('--wifi-pass <wifi-pass>', 'WIFI AP password')
    .option('--wifi-encryption <wifi-encryption>', 'WIFI AP encryption(this can be found using meross info --include-wifi)', parseIntWithValidation)
    .option('--wifi-cipher <wifi-cipher>', 'WIFI AP cipher (this can be found using meross info --include-wifi)', parseIntWithValidation)
    .option('--wifi-bssid <wifi-bssid>', 'WIFI AP BSSID (each octet seperated by a colon `:`)')
    .option('--wifi-channel <wifi-channel>', 'WIFI AP 2.5GHz channel number [1-13] (this can be found using meross info --include-wifi)', numberInRange(1, 13))
    .option('--mqtt <mqtt-server>', 'MQTT server address', collection)
    .option('-u, --user <user-id>', 'Integer id. Only useful for connecting to Meross Cloud.', parseIntWithValidation, 0)
    .option('-k, --key <shared-key>', 'Shared key for generating signatures', '')
    .option('-v, --verbose', 'Show debugging messages', '')
    .parse(process.argv)

const options = program.opts();

const ip = options.ip;
const key = options.key;
const userId = options.user;
const verbose = options.verbose;

let spinner = await terminal.spinner({ rightPadding: ' ' })
try {
    const http = new HTTP(ip);

    await configureDeviceTime({
        http,
        key,
        userId,
    });

    terminal("\n• Configured Device time.");

    if (options.mqtt && options.mqtt.length) {
        await configureMqttBrokers({
            http,
            key,
            userId,
            mqtt: options.mqtt
        });
        terminal("\n• Configured MQTT brokers.");
    }

    if (options.wifiSsid && options.wifiPass) {
        const deviceAbility = await queryDeviceAbility({
            http,
            key,
            userId,
        });

        deviceAbility[Namespace.CONFIG_WIFIX] = {};

        let credentials;
        if (Namespace.CONFIG_WIFIX in deviceAbility) {
            const deviceInformation = await queryDeviceInformation({
                http,
                key,
                userId,
            });

            credentials = new SecureWifiCredentials(options.wifiSsid, options.wifiPass);
            credentials.encrypt({
                ...deviceInformation.hardware
            });
            console.log(credentials);
            process.exit();
        } else {
            credentials = new WifiCredentials(options.wifiSsid, options.wifiPass);
        }

        await configureWifiParameters({
            http,
            key,
            userId,
            parameters: {
                credentials,
                channel: options.wifiChannel,
                encryption: options.wifiEncryption,
                cipher: options.wifiCipher,
                bssid: options.wifiBssid,
            }
        });

        terminal("\n• Configured WIFI.");
        terminal.green(`Device will now reboot...`);
    }
} catch (error) {
    terminal.red(error.message);
} finally {
    spinner.animate(false);
}