#!/usr/bin/env node

'use strict';

const assert = require('assert');
const { resolve } = require('path');
const { exec } = require('child_process');
const libExecutable = resolve(__dirname, '../../dist/bin/cli.js');

exec(`${libExecutable} --file test/file/config.js -R test/util/events-reporter.js test/file/index.spec.js`, {
    cwd: resolve(__dirname, '../../'),
}, (err, stdout) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    const runnerEvents = stdout
        .toString()
        .trim()
        .split('\n')
        .map((evtName) => evtName.trim());

    assert(runnerEvents.includes('>>>>> If we see this log then the file got loaded by the --file option'));
});
