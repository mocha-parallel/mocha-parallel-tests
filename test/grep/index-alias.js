#!/usr/bin/env node

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var libExecutable = path.resolve(__dirname, '../../dist/bin/cli.js');

exec(libExecutable + ' -R json -g grep test/grep/tests', {
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

    assert.strictEqual(jsonReporterOutput.stats.passes, 3);
});
