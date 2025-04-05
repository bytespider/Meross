#!/usr/bin/env node

'use strict'

import pkg from '../package.json' with { type: 'json' };
import { program } from 'commander';

program
  .version(pkg.version)
  .command('ability [options]', 'display a list of abilities for a device')
  .command('wifi [options]', 'display wifi access points discovered by a device')
  .command('time [options]', 'display the time on a device')

program.parse(process.argv);