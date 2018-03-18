#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const exec = require('child_process').exec;
const libExecutable = path.resolve(__dirname, '../../dist/bin/cli.js');

exec(`${libExecutable} test/syntax-errors/tests/`, {
    cwd: path.resolve(__dirname, '../../')
}, function (err) {
    // node.js doesn't support destructuring assignment
    const majorNodeVersion = Number(process.versions.node.split('.')[0]);
    const shouldProduceError = (majorNodeVersion < 6);

    if (shouldProduceError) {
        assert(err, `Error should have happened (node version ${process.versions.node})`);
        assert.strictEqual(err.code, 1);
    } else {
        assert.strictEqual(err, null, 'Unexpected error occured');
    }
});
