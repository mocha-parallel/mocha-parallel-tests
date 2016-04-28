#!/usr/bin/env node

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var libExecutable = path.resolve(__dirname, '../../dist/bin/mocha-parallel-tests');

exec(libExecutable + ' -R json --timeout 60000 --slow 30000 test/only-tests-run/tests', {
    cwd: path.resolve(__dirname, '../../')
}, function (err, stderr) {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    var jsonReporterOutput = stderr.toString();

    try {
        jsonReporterOutput = JSON.parse(jsonReporterOutput);
    } catch (ex) {
        console.error('Native JSON reporter output is not valid JSON: ' + jsonReporterOutput);
        process.exit(1);
    }

    assert.strictEqual(jsonReporterOutput.stats.suites, 2, 'Suites number is wrong');
    assert.strictEqual(jsonReporterOutput.stats.tests, 3, 'Tests number is wrong');
    assert.strictEqual(jsonReporterOutput.stats.passes, 3, 'Passes number is wrong');
});
