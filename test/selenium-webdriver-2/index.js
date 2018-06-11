#!/usr/bin/env node

'use strict';

const assert = require('assert');
const MochaParallelTests = require('../../dist/main/mocha').default;

const EXPECTED_EXECUTION_TIME_MOCHA_MS = 1000;
const EXEC_START_TIME = Date.now();
const STREAMS = ['stdout', 'stderr'];

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
    assert.strictEqual(failuresTotal, 0, `Run() callback argument (failures number) is wrong: ${failuresTotal}`);

    assert(jsonResult !== undefined, '"end" event was not fired');
    assert(jsonResult !== null && typeof jsonResult === 'object', `Reporter output is not valid JSON: ${jsonResult}`);

    assert.strictEqual(global['selenium-webdriver-2'], 1, 'Hooks file was not executed');
    assert.strictEqual(jsonResult.stats.suites, 4);
    assert.strictEqual(jsonResult.stats.tests, 6);
    assert.strictEqual(jsonResult.stats.passes, 6);

    const testsSerialDuration = jsonResult.passes.reduce((memo, passData) => memo + passData.duration, 0);
    const expectedDuration = testsSerialDuration + EXPECTED_EXECUTION_TIME_MOCHA_MS;
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
        .enableExitMode()
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
