#!/usr/bin/env node

'use strict';

const assert = require('assert');
const { resolve } = require('path');
const { exec } = require('child_process');
const libExecutable = resolve(__dirname, '../../dist/bin/cli.js');

exec(`${libExecutable} --max-parallel 1 test/reusing-processes/index.spec.js test/reusing-processes/index.2.spec.js`, {
    cwd: resolve(__dirname, '../../'),
}, (err, stdout) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    const [pid1, pid2] = stdout.split(/\n/g).filter(line => /^pid/.test(line));

    if (pid1 && pid2) assert.strictEqual(pid1, pid2);
});
