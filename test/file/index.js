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

    console.log('running the test');

    const runnerEvents = stdout
        .toString()
        .trim()
        .split('\n')
        .map((evtName) => evtName.trim());

    console.log(runnerEvents);

    assert.strictEqual(runnerEvents[0], 'start');
    assert.strictEqual(runnerEvents[1], 'suite'); // main process root suite
    assert.strictEqual(runnerEvents[2], 'waiting'); // subprocess waiting event
    assert.strictEqual(runnerEvents[3], 'suite'); // subprocess root suite
    assert.strictEqual(runnerEvents[4], 'suite'); // subprocess top level suite
    assert(runnerEvents.includes('pass'), 'Test case was not executed');
});
