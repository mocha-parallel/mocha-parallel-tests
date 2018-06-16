#!/usr/bin/env node

const assert = require('assert');
const { expect } = require('chai');
const { exec } = require('child_process');
const { resolve } = require('path');
const libExecutable = resolve(__dirname, '../../dist/bin/cli.js');
const reporterPath = resolve(__dirname, '../util/events-reporter.js');

const cleanOutput = (buf) => String(buf)
    .split('\n')
    .filter(Boolean);

const runSpec = (spec) => {
    const cwd = resolve(__dirname, '../../');
    const specPath = resolve(__dirname, 'spec', spec) + '/';

    return new Promise((resolve) => {
        exec(`${libExecutable} -R ${reporterPath} --max-parallel 2 ${specPath}`, { cwd }, function (err, stdout, stderr) {
            if (err) {
                resolve({
                    stdout: cleanOutput(stdout),
                    stderr: cleanOutput(stderr),
                    code: err.code,
                });
            } else {
                resolve({
                    stdout: cleanOutput(stdout),
                    stderr: cleanOutput(stderr),
                    code: 0,
                });
            }
        });
    });
};

Promise.resolve()
    // one simple crash in the middle of a process
    .then(() => runSpec('one-crash'))
    .then(function oneCrash({ code, stdout }) {
        expect(stdout).to.deep.equal(['start', 'suite', 'suite', 'suite', 'test', 'pass', 'test end', 'test']);
        assert.strictEqual(code, 255, `"one-crash" spec finished with wrong exit code: ${code}`);
    })
    // one simple crash in the beginning of a process
    .then(() => runSpec('one-crash-early'))
    .then(function oneCrashEarly({ code, stderr, stdout }) {
        expect(stderr).to.deep.equal(['I am about to exit...']);
        expect(stdout).to.deep.equal(['start', 'suite']); // top level main process suite
        assert.strictEqual(code, 255, `"one-crash-early" spec finished with wrong exit code: ${code}`);
    })
    // one simple crash in the middle, one okay
    .then(() => runSpec('one-crash-one-ok'))
    .then(function oneCrashOneOk({ code, stdout }) {
        expect(stdout).to.deep.equal(['start', 'suite', 'suite', 'suite', 'test', 'pass', 'test end', 'suite end', 'suite end', 'suite', 'suite', 'test', 'pass', 'test end', 'test']);
        assert.strictEqual(code, 255, `"one-crash-one-ok" spec finished with wrong exit code: ${code}`);
    })
    // one simple crash in the beginning, one okay
    .then(() => runSpec('one-crash-early-one-ok'))
    .then(function oneCrashEarlyOneOk({ code, stdout }) {
        expect(stdout).to.deep.equal(['start', 'suite']);
        assert.strictEqual(code, 255, `"one-crash-early-one-ok" spec finished with wrong exit code: ${code}`);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
