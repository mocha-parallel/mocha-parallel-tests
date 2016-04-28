#!/usr/bin/env node

'use strict';

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var libExecutable = path.resolve(__dirname, '../../dist/bin/mocha-parallel-tests');

exec(libExecutable + ' --timeout 60000 --slow 30000 test/console-log-inject/tests', {
    cwd: path.resolve(__dirname, '../../')
}, function (err, stdout, stderr) {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    var reporterOutput = stdout.toString();
    var logs = reporterOutput.split('\n').reduce(function (logs, chunk) {
        chunk = chunk.trim();

        if (/^suite\s#[\d]+/i.test(chunk)) {
            logs.push(chunk.toLowerCase());
        }
        
        return logs;
    }, []);

    var expectedLogsOrder = [
        'suite #1 log at the beginning',
        'suite #1 log at the end',
        'suite #1',
        'suite #1 test #1 log at the beginning',
        'suite #1 test #1 log before end',
        'suite #2',
        'suite #2 test #1 log at the beginning',
        'suite #2 test #1 log before end',
    ];

    expectedLogsOrder.forEach(function (chunk, index) {
        assert.strictEqual(logs[index], chunk, 'Index #' + index + ' log order is wrong. Expected: "' + chunk + '". Actual: "' + logs[index] + '"');
    });
});
