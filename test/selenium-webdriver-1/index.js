#!/usr/bin/env node

'use strict';

const assert = require('assert');
const path = require('path');
const exec = require('child_process').exec;
// const spawn_process = require('../spawn_process');
const libExecutable = path.resolve(__dirname, '../../dist/bin/mocha-parallel-tests');

const EXPECTED_DURATION = 30000;

const proc = exec(`${libExecutable} --reporter json-stream --slow ${EXPECTED_DURATION} --timeout ${EXPECTED_DURATION} test/selenium-webdriver-1/tests/`, {
    cwd: path.resolve(__dirname, '../../'),
    env: process.env
});

proc.stdout.setEncoding('utf8');

proc.stdout.on('data', function (chunk) {
    if (!chunk.startsWith('["end"')) {
        return;
    }

    const chunkObj = JSON.parse(chunk);
    const stats = chunkObj[1];

    assert.strictEqual(stats.suites, 3);
    assert.strictEqual(stats.tests, 7);
    assert.strictEqual(stats.passes, 6);
    assert.strictEqual(stats.failures, 1);
    assert(stats.duration < EXPECTED_DURATION, `Tests duration seems to be too long: ${stats.duration}ms`);
});
