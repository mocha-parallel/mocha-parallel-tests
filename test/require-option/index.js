#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const exec = require('child_process').exec;
const libExecutable = path.resolve(__dirname, '../../dist/bin/mocha-parallel-tests');

exec(`${libExecutable} --require test/require-option/require-module.js test/require-option/test.js`, {
    cwd: path.resolve(__dirname, '../../')
}, function (err, stdout, stderr) {
    assert.strictEqual(err, null, `
        Unexpected error occured during test execution process.
        Stdout: ${stdout}
        Stderr: ${stderr}
    `);
});
