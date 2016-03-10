#!/usr/bin/env node

'use strict';

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var libExecutable = path.resolve(__dirname, '../../bin/mocha-parallel-tests');

exec(libExecutable + ' --timeout 60000 --slow 30000 test/console-log-inject/tests', {
    cwd: path.resolve(__dirname, '../../')
}, function (err, stderr) {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    var reporterOutput = stderr.toString();
    var logs = reporterOutput.split('\n').reduce(function (logs, chunk) {
        chunk = chunk.trim();

        if (/^suite\s#[\d]+\slog$/.test(chunk)) {
            logs.push(chunk);
        }
        
        return logs;
    }, []);

    assert.strictEqual(logs[0], 'suite #1 log', 'First suite is wrong');
    assert.strictEqual(logs[1], 'suite #1 log', 'First suite is wrong');
    assert.strictEqual(logs[2], 'suite #2 log', 'Second suite is wrong');
    assert.strictEqual(logs[3], 'suite #2 log', 'Second suite is wrong');
});
