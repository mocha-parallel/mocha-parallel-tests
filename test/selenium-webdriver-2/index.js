#!/usr/bin/env node

'use strict';

const assert = require('assert');
const MochaParallelTests = require('../../dist/api.js');

const EXPECTED_EXECUTION_TIME_MOCHA_MS = 1000;
const STREAMS = ['stdout', 'stderr'];
const EXEC_START_TIME = Date.now();

const originalWrites = {};
const mocha = new MochaParallelTests;

let failuresTotal;
let jsonResult;
let globalException;

const patchStreams = () => {
    for (let streamName of STREAMS) {
        const stream = process[streamName];
        originalWrites[streamName] = stream.write.bind(stream);

        // mute standard streams
        // also replace process.stdout.write with process.stderr.write
        // because this is current mocha behaviour
        stream.write = () => {
            return stream;
        };
    }
};

const restoreOriginalStreams = () => {
    for (let streamName of STREAMS) {
        const stream = process[streamName];
        stream.write = originalWrites[streamName];
    }
};

process.on('exit', () => {
    restoreOriginalStreams();

    assert(globalException === undefined, `Failed running mocha-parallel-tests: ${globalException && globalException.stack}`);
    assert(failuresTotal !== undefined, 'Run() callback was not executed');
    assert.strictEqual(failuresTotal, 0, `Run() callback argument is wrong: ${failuresTotal}`);

    assert(jsonResult !== undefined, '"end" event was not fired');
    assert(jsonResult !== null && typeof jsonResult === 'object', `Reporter output is not valid JSON: ${jsonResult}`);
    console.log(jsonResult);

    assert.strictEqual(global['selenium-webdriver-2'], 1, 'Hooks file was not executed');
    assert.strictEqual(jsonResult.stats.suites, 2);
    assert.strictEqual(jsonResult.stats.tests, 6);
    assert.strictEqual(jsonResult.stats.passes, 6);

    const suitesDuration = new Map;
    for (let passData of jsonResult.passes) {
        const suiteName = passData.fullTitle.replace(passData.title, '').trim();
        let suiteDuration = suitesDuration.get(suiteName) || 0;

        // test cases are executed one after another
        suiteDuration += passData.duration;
        suitesDuration.set(suiteName, suiteDuration);
    }

    // suites should run in parallel, the longest one is the expected duration
    const expectedDuration = Math.max(...suitesDuration.values()) + EXPECTED_EXECUTION_TIME_MOCHA_MS;
    const actualDuration = Date.now() - EXEC_START_TIME;
    assert(actualDuration < expectedDuration, `Duration is too long (expected: ${expectedDuration}ms, actual: ${actualDuration}ms)`);
});

// patch streams so that stdout is muted
patchStreams();

try {
    mocha
        .reporter('json')
        .addFile(`${__dirname}/tests/parallel1.js`)
        .addFile(`${__dirname}/tests/parallel2.js`)
        .slow(30000)
        .timeout(30000)
        .run(failures => {
            failuresTotal = failures;
        }).on('end', function () {
            jsonResult = this.testResults || null;
        });
} catch (ex) {
    globalException = ex;
}
