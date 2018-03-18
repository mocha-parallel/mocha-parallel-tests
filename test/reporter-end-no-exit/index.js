#!/usr/bin/env node

'use strict';

const fs = require('fs');
const os = require('os');
const assert = require('assert');
const path = require('path');
const exec = require('child_process').exec;

const fileName = `${Date.now()}.txt`;
const filePath = `${os.tmpdir()}/${fileName}`;

const libExecutable = path.resolve(__dirname, '../../dist/bin/cli.js');

exec(`FILE=${fileName} ${libExecutable} --no-exit -R test/reporter-end-no-exit/tests/reporter/spec-file test/reporter-end-no-exit/tests/*.js`, {
    cwd: path.resolve(__dirname, '../../')
}, () => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw new Error(`expected ${filePath} file read`);
        }
        assert.equal(data.toString('utf8'), 'test', `expected ${filePath} to contain 'test' string`);
    });
});
