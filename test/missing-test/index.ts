#!/usr/bin/env node

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var libExecutable = path.resolve(__dirname, '../../dist/bin/mocha-parallel-tests');

exec(libExecutable + ' -R doc --timeout 60000 --slow 30000 test/missing-test/missing.js', {
    cwd: path.resolve(__dirname, '../../')
}, function (err) {
    assert(err, 'Err should exist');

    // "8 - Unused. In previous versions of Node, exit code 8 sometimes indicated an uncaught exception"
    // @see https://github.com/nodejs/node-v0.x-archive/blob/master/doc/api/process.markdown#exit-codes
    var expectedExitCode = (process.version.indexOf('v0.10.') === 0)
        ? 8
        : 1;

    assert.strictEqual(err.code, expectedExitCode, 'Error code should equal ' + expectedExitCode);
});
