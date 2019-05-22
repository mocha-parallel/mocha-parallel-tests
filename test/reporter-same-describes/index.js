#!/usr/bin/env node

const assert = require('assert');
const MochaParallelTests = require('../../dist/main/mocha').default;
const SilentReporter = require('../util/silent-reporter');
const { basename } = require('path');

const mocha = new MochaParallelTests;
const reportedFiles = [];

mocha
    .addFile(`${__dirname}/tests/first.js`)
    .addFile(`${__dirname}/tests/second.js`)
    .reporter(SilentReporter)
    .run()
    .on('suite', (suite) => {
        if (suite.file) {
            reportedFiles.push(basename(suite.file));
        }
    });

process.on('exit', () => {
    assert(reportedFiles.includes('first.js'), 'suite in first.js not reported');
    assert(reportedFiles.includes('second.js'), 'suite in second.js not reported');
});