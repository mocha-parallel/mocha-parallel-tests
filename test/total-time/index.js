#!/usr/bin/env node

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var libExecutable = path.resolve(__dirname, '../../dist/bin/cli.js');

exec(libExecutable + ' -R json --timeout 60000 --slow 60000 --max-parallel 2 test/total-time/tests', {
    cwd: path.resolve(__dirname, '../../')
}, function (err, stdout) {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    var jsonReporterOutput = stdout.toString();

    try {
        jsonReporterOutput = JSON.parse(jsonReporterOutput);
    } catch (ex) {
        console.error('Native JSON reporter output is not valid JSON: ' + jsonReporterOutput);
        process.exit(1);
    }

    // when parallel1.js is over it's about 3000ms passed from the beginning
    // by this time parallel2.js has been started executing and is still on
    // parallel2.js should finish after 5 seconds from the beginning
    // parallel3.js starts right after parallel1.js finishes, so its finish time is about 6000ms
    assert.ok(jsonReporterOutput.stats.duration >= 6000, 'Tests duration is too small');
    assert.ok(jsonReporterOutput.stats.duration < 7000, 'Tests duration is too big');
});
