#!/usr/bin/env node

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var libExecutable = path.resolve(__dirname, '../../dist/bin/cli.js');

exec(libExecutable + ' --full-trace --reporter json test/full-trace/index.spec.js', {
    cwd: path.resolve(__dirname, '../../')
}, function (err, stderr) {
    var jsonReporterOutput = stderr.toString();

    try {
        jsonReporterOutput = JSON.parse(jsonReporterOutput);
    } catch (ex) {
        console.error('Native JSON reporter output is not valid JSON: ' + jsonReporterOutput);
        process.exit(1);
    }

    const { stack } = jsonReporterOutput.failures[0].err;
    assert(stack.split('\n').length > 2, `Stack doesn't look full: ${stack}`);
});
