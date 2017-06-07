#!/usr/bin/env node

'use strict';

const assert = require('assert');
const path = require('path');
const exec = require('child_process').exec;
const libExecutable = path.resolve(__dirname, '../../dist/bin/mocha-parallel-tests');

exec(`${libExecutable} -R json --recursive`, {
    cwd: path.dirname(__filename)
}, (err, stderr) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    let jsonReporterOutput = stderr.toString();
    try {
        jsonReporterOutput = JSON.parse(jsonReporterOutput);
    } catch (ex) {
        console.error('Native JSON reporter output is not valid JSON: ' + jsonReporterOutput);
        process.exit(1);
    }

    assert.strictEqual(jsonReporterOutput.stats.suites, 2);
    assert.strictEqual(jsonReporterOutput.stats.tests, 2);
    assert.strictEqual(jsonReporterOutput.stats.passes, 2);
    assert.strictEqual(jsonReporterOutput.stats.failures, 0);
});
