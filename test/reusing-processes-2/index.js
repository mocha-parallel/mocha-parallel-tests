#!/usr/bin/env node

'use strict';

const assert = require('assert');
const { resolve } = require('path');
const { exec } = require('child_process');
const libExecutable = resolve(__dirname, '../../dist/bin/cli.js');

exec(`${libExecutable} --max-parallel 2 --timeout 4000 test/reusing-processes-2/index.1.spec.js test/reusing-processes-2/index.2.spec.js test/reusing-processes-2/index.3.spec.js`, {
    cwd: resolve(__dirname, '../../'),
}, (err, stdout) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    const pid1 = (stdout.match(/suite 1\npid: (\d+)/) || [])[1];
    const pid2 = (stdout.match(/suite 2\npid: (\d+)/) || [])[1];
    const pid3 = (stdout.match(/suite 3\npid: (\d+)/) || [])[1];

    if (pid1 && pid2 && pid3) {
        assert.strictEqual(pid3, pid2);
        assert.notEqual(pid1, pid2);
    }
});
