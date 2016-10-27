#!/usr/bin/env node

'use strict';

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var inspect = require('util').inspect;
var libExecutable = path.resolve(__dirname, '../../dist/bin/mocha-parallel-tests');

// SauceLabs has limitation for concurrent tests for OSS projects.
// But TravisCI runs tests for different node versions in parallel.
if (!process.versions.node.startsWith('7.')) {
    console.log(`Skip test in non-stable node.js version ${process.versions.node}`);
    process.exit(0);
}

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

    if (err && err.code) {
        console.log('JSON reporter output:');
        console.log(inspect(jsonReporterOutput, {depth: null, colors: true}));
    }

    assert.strictEqual(jsonReporterOutput.stats.suites, 2, `Suites number is wrong: ${jsonReporterOutput.stats.suites}`);
    assert.strictEqual(jsonReporterOutput.stats.tests, 2, `Tests number is wrong: ${jsonReporterOutput.stats.tests}`);
    assert(jsonReporterOutput.stats.duration > 100, `Tests duration seems to be too long: ${jsonReporterOutput.stats.duration}ms`);
});
