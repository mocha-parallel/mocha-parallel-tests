#!/usr/bin/env node

const assert = require('assert');
const { spawn } = require('child_process');
const { resolve } = require('path');

const libExecutable = resolve(__dirname, '../../dist/bin/cli.js');
const testPath = resolve(__dirname, 'index.spec.js');
const test = spawn(libExecutable, ['--exit', testPath]);

const timeoutId = setTimeout(() => {
    test.removeListener('close', onTestFinished);
    test.kill('SIGTERM');

    console.error('CLI process hangs :(');
    process.exit(1);
}, 10000);

const onTestFinished = (code) => {
    assert.strictEqual(code, 0, `CLI exit code is wrong: ${code}`);
    clearTimeout(timeoutId);
};

test.on('close', onTestFinished);
