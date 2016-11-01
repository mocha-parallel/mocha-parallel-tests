#!/usr/bin/env node

'use strict';

const fs = require('fs');
const assert = require('assert');
const path = require('path');
const exec = require('child_process').exec;

const fileName = `file${Math.random().toString(36).substr(2, 9)}.txt`;
const filePath = `${process.env.TMPDIR}${fileName}`;

const libExecutable = path.resolve(__dirname, '../../dist/bin/mocha-parallel-tests');

exec(`FILE=${fileName} ${libExecutable} --no-exit -R test/reporter-end-no-exit/tests/reporter/spec-file test/reporter-end-no-exit/tests/*.js`, {
    cwd: path.resolve(__dirname, '../../')
}, () => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw new Error(`expected ${filePath} file read`);
        }
        assert.equal(data.toString('utf8'), 'writed', `expected ${filePath} to contain 'writed' string`);
    });
});