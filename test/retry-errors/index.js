#!/usr/bin/env node

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var libExecutable = path.resolve(__dirname, '../../bin/mocha-parallel-tests');

exec(libExecutable + ' --retry 2 --slow 3000 test/retry-errors/tests', {
    cwd: path.resolve(__dirname, '../../')
}, function (err, stdout, stderr) {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    var debugMessagesOutput = stderr.toString();
    assert.notStrictEqual(debugMessagesOutput.indexOf('try #1 failed'), -1, 'No into about retry #1 in stderr');
    assert.notStrictEqual(debugMessagesOutput.indexOf('try #2 failed'), -1, 'No into about retry #2 in stderr');
});
