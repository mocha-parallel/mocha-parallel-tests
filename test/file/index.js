#!/usr/bin/env node

'use strict';

const assert = require('assert');
const { resolve } = require('path');
const { exec } = require('child_process');
const libExecutable = resolve(__dirname, '../../dist/bin/cli.js');

exec(`${libExecutable} --file test/file/config.js -R test/file/reporter.js test/file/index.spec.js`, {
    cwd: resolve(__dirname, '../../'),
}, (err, stdout) => {
    if(err) {
        console.error(err);
        process.exit(1);
    }

    const runnerEvents = stdout
        .toString()
        .trim()
        .split('\n')
        .map((evtName) => evtName.trim());

    assert.strictEqual(runnerEvents[0], 'start');
    assert.strictEqual(runnerEvents[1], 'suite'); // main process root suite

    // log from --file option
    assert.strictEqual(runnerEvents[2], '>>>>> If we see this log then the file got loaded by the --file option');

    assert.strictEqual(runnerEvents[3], 'suite'); // subprocess root suite
    assert.strictEqual(runnerEvents[4], 'suite'); // subprocess top level suite
    assert(runnerEvents.includes('pass'), 'Test case was not executed');
});
