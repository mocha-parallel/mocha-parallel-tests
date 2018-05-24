#!/usr/bin/env node

const assert = require('assert');
const { expect } = require('chai');
const { exec } = require('child_process');
const { resolve } = require('path');
const libExecutable = resolve(__dirname, '../../dist/bin/cli.js');
const reporterPath = resolve(__dirname, '../util/events-reporter.js');

const runSpec = (spec) => {
    const cwd = resolve(__dirname, '../../');
    const specPath = resolve(__dirname, 'spec', spec) + '/';

    return new Promise((resolve) => {
        exec(`${libExecutable} -R ${reporterPath} ${specPath}`, { cwd }, function (err, stdout, stderr) {
            if (err) {
                resolve({
                    stdout: String(stdout).split('\n').filter(Boolean),
                    stderr,
                    code: err.code,
                });
            } else {
                resolve({
                    stdout: String(stdout).split('\n').filter(Boolean),
                    stderr,
                    code: 0,
                });
            }
        });
    });
};

Promise.resolve()
    // one simple crash in the middle of a process
    .then(() => runSpec('one-crash'))
    .then(({ code, stdout }) => {
        expect(stdout, ['start', 'suite', 'suite', 'test', 'pass', 'test end', 'test']);
        assert.strictEqual(code, 255, `"one-crash" spec finished with wrong exit code: ${code}`);
    })
    // one simple crash in the beginning of a process
    .then(() => runSpec('one-crash-early'))
    .then(({ code, stdout }) => {
        expect(stdout, []);
        assert.strictEqual(code, 255, `"one-crash-early" spec finished with wrong exit code: ${code}`);
    })
    // one simple crash in the middle, one okay
    .then(() => runSpec('one-crash-one-ok'))
    .then(({ code, stdout }) => {
        expect(stdout, ['start', 'suite', 'suite', 'test', 'pass', 'test end', 'test']);
        assert.strictEqual(code, 255, `"one-crash-one-ok" spec finished with wrong exit code: ${code}`);
    })
    // one simple crash in the beginning, one okay
    .then(() => runSpec('one-crash-early-one-ok'))
    .then(({ code, stdout }) => {
        expect(stdout, []);
        assert.strictEqual(code, 255, `"one-crash-early-one-ok" spec finished with wrong exit code: ${code}`);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
