#!/usr/bin/env node

var path = require('path');
var exec = require('child_process').exec;
var libExecutable = path.resolve(__dirname, '../../dist/bin/cli.js');

exec(libExecutable + ' --exit --timeout 15000 --reporter json test/race-condition-timeout/index.spec.js', {
    cwd: path.resolve(__dirname, '../../')
}, function (err, stderr) {
    var jsonReporterOutput = stderr.toString();

    try {
        jsonReporterOutput = JSON.parse(jsonReporterOutput);
    } catch (ex) {
        console.error('Native JSON reporter output is not valid JSON: ' + jsonReporterOutput);
        process.exit(1);
    }

    // we just want to make sure that the test output is a JSON string
});
