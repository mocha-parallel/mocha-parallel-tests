#!/usr/bin/env node

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var libExecutable = path.resolve(__dirname, '../../dist/bin/mocha-parallel-tests');

exec(libExecutable + ' --retry 1 -R json --slow 3000 test/retry/tests', {
    cwd: path.resolve(__dirname, '../../')
}, function (err, stdout) {
    var jsonReporterOutput = stdout.toString();

    try {
        jsonReporterOutput = JSON.parse(jsonReporterOutput);
    } catch (ex) {
        console.error('Native JSON reporter output is not valid JSON: ' + jsonReporterOutput);
        process.exit(1);
    }

    assert.strictEqual(jsonReporterOutput.stats.suites, 2, 'Suites number is wrong');
    assert.strictEqual(jsonReporterOutput.stats.tests, 4, 'Tests number is wrong');
    assert.strictEqual(jsonReporterOutput.stats.passes, 4, 'Passes number is wrong');
});
