#!/usr/bin/env node

'use strict';

const assert = require('assert');
const path = require('path');
const exec = require('child_process').exec;

const cwd = path.resolve(__dirname, '../../');
const mpt = path.resolve(__dirname, '../../dist/bin/mocha-parallel-tests');
const mocha = path.resolve(__dirname, '../../node_modules/.bin/mocha');

const execWait = (file) => {
    return new Promise(resolve => {
        exec(`${file} --bail --reporter json test/bail/tests/`, {cwd}, (err, stdout, stderr) => {
            resolve({
                exitCode: err ? err.code : 0,
                stdout: stdout ? stdout.toString() : '',
                stderr: stderr ? stderr.toString() : ''
            });
        });
    });
};

Promise.all([
    execWait(mocha),
    execWait(mpt)
]).then((res) => {
    const mochaResults = res[0];
    const mptResults = res[1];
    const mochaReporterJSON = JSON.parse(mochaResults.stdout);
    let mptReporterJSON;

    assert(mochaResults.exitCode === mptResults.exitCode, 'Exit codes of mocha and mocha-parallel-tests differ');
    assert(mochaResults.stderr === mptResults.stderr, 'Stderr outputs of mocha and mocha-parallel-tests differ');

    try {
        mptReporterJSON = JSON.parse(mptResults.stdout);
    } catch (err) {
        console.log(`mocha-parallel-test's stdout is not a valid JSON: ${mptResults.stdout}`);
        process.exit(1);
    }

    for (let metric of ['suites', 'tests', 'passes', 'pending', 'failures']) {
        assert(
            mochaReporterJSON.stats[metric] === mptReporterJSON.stats[metric],
            `${metric} stat of mocha and mocha-parallel-tests differs`
        );
    }
});
