#!/usr/bin/env node

'use strict';

const assert = require('assert');
const { resolve } = require('path');
const { exec } = require('child_process');
const libExecutable = resolve(__dirname, '../../dist/bin/cli.js');

exec(`${libExecutable} --max-parallel 1 test/process-timeouts/index.spec.js`, {
    cwd: resolve(__dirname, '../../'),
}, err => {
    assert(err);
});
