#!/usr/bin/env node

'use strict';

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var libExecutable = path.resolve(__dirname, '../../dist/bin/cli.js');

exec(`${libExecutable} --reporter json --slow 30000 --timeout 30000 --exit test/selenium-webdriver/test.js`, {
    cwd: path.resolve(__dirname, '../../')
}, function (err, stdout) {
    let jsonReporterOutput = stdout.toString();
    try {
        jsonReporterOutput = JSON.parse(jsonReporterOutput);
    } catch (ex) {
        console.error(`Native JSON reporter output is not valid JSON: ${jsonReporterOutput}`);
        process.exit(1);
    }

    if (err && err.code) {
        console.log(`JSON reporter output: ${JSON.stringify(jsonReporterOutput, null, 2)}`);
    }

    assert.strictEqual(jsonReporterOutput.stats.suites, 3, `Suites number is wrong: ${jsonReporterOutput.stats.suites}`);
    assert.strictEqual(jsonReporterOutput.stats.tests, 2, `Tests number is wrong: ${jsonReporterOutput.stats.tests}`);
    assert(jsonReporterOutput.stats.duration > 100, `Tests duration seems to be too long: ${jsonReporterOutput.stats.duration}ms`);
});
