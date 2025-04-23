#!/usr/bin/env node

'use strict'

import pkg from '../../../package.json' with { type: 'json' };
import TerminalKit from 'terminal-kit';
import { program } from 'commander';
import { Device } from '../src/device.js';
import { HTTPTransport } from '../src/transport/http.js';
import { logger } from '../src/util.js';
import { parseIntWithValidation } from '../src/cli.js';

const { terminal } = TerminalKit;

program
  .version(pkg.version)
  .arguments('<options>')
  .requiredOption(
    '-a, --addr, --ip <ip>',
    'Send command to device with this IP address',
    '10.10.10.1',
  )
  .option(
    '-u, --user <user-id>',
    'Integer id. Used by devices connected to the Meross Cloud',
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

if (verbose) {
  logger.transports[0].level = 'debug';
}

try {
  const transport = new HTTPTransport({ ip });
  const device = new Device({
    transport, credentials: {
      userId,
      key
    }
  });

  const abilities = await device.querySystemAbility();
  terminal.table([
    ['Ability', 'Parameters'],
    ...Object.entries(abilities).map(([ability, params]) => [ability, JSON.stringify(params)])
  ], {
    firstRowTextAttr: { color: 'white', bold: true, underline: true },
    hasBorder: false,
    width: 80
  });
} catch (error) {
  logger.error(error);
}