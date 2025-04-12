#!/usr/bin/env node

'use strict';

import pkg from '../package.json' with { type: 'json' };
import { program } from 'commander';
import TerminalKit from 'terminal-kit';
const { terminal } = TerminalKit;

import { printDeviceTable, printWifiListTable, progressFunctionWithMessage } from './cli.js';

import { HTTPTransport, Device, computeDevicePassword, Namespace, computePresharedPrivateKey, generateKeyPair } from '@meross/lib';

type Options = {
  ip: string;
  user: number;
  key: string;
  privateKey: string | boolean;
  withWifi: boolean;
  withAbility: boolean;
  includeTime: boolean;
  quiet: boolean;
};

program
  .version(pkg.version)
  .arguments('[options]')
  .option(
    '-a, --ip <ip>',
    'Send command to device with this IP address',
    '10.10.10.1'
  )
  .option(
    '-u, --user <user-id>',
    'Integer id. Used by devices connected to the Meross Cloud',
    parseInt,
    0
  )
  .option(
    '-k, --key <shared-key>', 
    'Shared key for generating signatures', 
    ''
  )
  .option('--private-key [private-key]', `Private key for ECDH key exchange. If not provided a new one will be generated`)
  .option('--with-wifi', 'List WIFI Access Points near the device')
  .option('--with-ability', 'List device ability list')
  .option('-q, --quiet', 'Suppress all output', false)
  .parse(process.argv);

const options = program.opts<Options>();

const { ip, user: userId, key } = options;
const { quiet } = options;

try {
  const transport = new HTTPTransport({ url: `http://${ip}/config`, credentials: { userId, key } });
  const device = new Device();

  device.setTransport(transport);

  const deviceInformation = await device.fetchDeviceInfo();

  const devicePassword = computeDevicePassword(
    deviceInformation.system.hardware.macAddress,
    key,
    deviceInformation.system.firmware.userId
  );

  const { withAbility = false } = options;
  let deviceAbility = await device.fetchDeviceAbilities();
  if (!quiet) {
    await printDeviceTable(deviceInformation, withAbility ? deviceAbility : undefined, devicePassword);
  }

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

  const { withWifi = false } = options;
  if (withWifi) {
    const fetchNearbyWifi = () => device.fetchNearbyWifi();
    const wifiList = await (quiet ? fetchNearbyWifi() : progressFunctionWithMessage(() => fetchNearbyWifi(), 'Getting WIFI list'));

    if (!quiet && wifiList) {
      await printWifiListTable(wifiList);
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
