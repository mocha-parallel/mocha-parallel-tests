#!/usr/bin/env node

'use strict';

const assert = require('assert');
const { resolve } = require('path');
const { exec } = require('child_process');

const libExecutable = resolve(__dirname, '../../dist/bin/cli.js');
const spec = resolve(__dirname, 'index.spec.js');
const reporter = resolve(__dirname, '../util/events-reporter.js');

const cleanOutput = (buf) => String(buf)
    .split('\n')
    .filter(Boolean);

exec(`${libExecutable} -R ${reporter} --retries 2 --bail ${spec}`, {
    cwd: __dirname,
}, (err, stdout) => {
    if (!err) {
        console.error('Process should have finished with an error');
        process.exit(1);
    }

    const events = cleanOutput(stdout);
    const lastEvent = events.pop();
    assert.strictEqual(lastEvent, 'end', `Last event is not end: ${lastEvent}`);
});
