#!/usr/bin/env node

'use strict';

const assert = require('assert');
const { resolve } = require('path');
const { exec } = require('child_process');
const libExecutable = resolve(__dirname, '../../dist/bin/cli.js');

exec(`${libExecutable} --max-parallel 1 test/reusing-processes-2/index.1.spec.js test/reusing-processes-2/index.2.spec.js`, {
    cwd: resolve(__dirname, '../../'),
}, err => {
    assert(err);
});
