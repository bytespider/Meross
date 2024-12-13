#!/usr/bin/env node --no-warnings

'use strict'

import pkg from '../package.json' with { type: 'json' };
import { program } from 'commander';

program
  .version(pkg.version)

program
  .command('info [options]', 'get information about compatable Meross smart device')
  .command('setup [options]', 'setup compatable Meross smart device')

program.parse(process.argv)
