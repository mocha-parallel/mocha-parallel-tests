#!/usr/bin/env node

'use strict';

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var libExecutable = path.resolve(__dirname, '../../dist/bin/mocha-parallel-tests');

exec(`${libExecutable} --reporter json --slow 30000 --timeout 30000 test/selenium-webdriver/test.js`, {
    cwd: path.resolve(__dirname, '../../')
}, function (err, stdout) {
    let jsonReporterOutput = stdout.toString();
    try {
        jsonReporterOutput = JSON.parse(jsonReporterOutput);
    } catch (ex) {
        console.error(`Native JSON reporter output is not valid JSON: ${jsonReporterOutput}`);
        process.exit(1);
    }

    assert.strictEqual(jsonReporterOutput.stats.suites, 2, `Suites number is wrong: ${jsonReporterOutput.stats.suites}`);
    assert.strictEqual(jsonReporterOutput.stats.tests, 2, `Tests number is wrong: ${jsonReporterOutput.stats.suites}`);
    assert(jsonReporterOutput.stats.duration > 100, `Tests duration seems to be wrong: ${jsonReporterOutput.stats.duration}ms`);
});
