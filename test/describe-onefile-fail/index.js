#!/usr/bin/env node

'use strict';

const assert = require('assert');
const path = require('path');
const exec = require('child_process').exec;
const libExecutable = path.resolve(__dirname, '../../dist/bin/mocha-parallel-tests');

exec(`${libExecutable} -R json --retry 1 test/describe-onefile-fail/test.spec.js`, {
    cwd: path.resolve(__dirname, '../../')
}, (err, stdout) => {
    assert(!err, `Error occured: ${err}`);

    let jsonReporterOutput = stdout.toString();
    try {
        jsonReporterOutput = JSON.parse(jsonReporterOutput);
    } catch (ex) {
        console.error(`Native JSON reporter output is not valid JSON: ${jsonReporterOutput || '(empty)'}`);
        process.exit(1);
    }

    assert.strictEqual(jsonReporterOutput.stats.suites, 3);
    assert.strictEqual(jsonReporterOutput.stats.tests, 3);
    assert.strictEqual(jsonReporterOutput.stats.passes, 3);
    assert.strictEqual(jsonReporterOutput.stats.failures, 0);
});
