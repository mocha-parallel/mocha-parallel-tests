#!/usr/bin/env node

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var libExecutable = path.resolve(__dirname, '../../bin/mocha-parallel-tests');

exec(libExecutable + ' -R doc --timeout 60000 --slow 30000 test/missing-test/missing.js', {
    cwd: path.resolve(__dirname, '../../')
}, function (err) {
    assert(err, 'Err should exist');
    assert.strictEqual(err.code, 8, 'Error code should equal 8');
});
