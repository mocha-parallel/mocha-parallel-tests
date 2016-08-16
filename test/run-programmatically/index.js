#!/usr/bin/env node

'use strict';

const assert = require('assert');
const MochaParallelTests = require('../../dist/index.js');

const STREAMS = ['stdout', 'stderr'];
const originalWrites = {};
const mocha = new MochaParallelTests;

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

// patch streams so that stdout is muted
patchStreams();

mocha
    .reporter('json')
    .addFile(`${__dirname}/tests/parallel1.js`)
    .addFile(`${__dirname}/tests/parallel2.js`)
    .slow(8000)
    .timeout(10000)
    .run()
        .on('end', function () {
            restoreOriginalStreams();

            const json = this.testResults;
            if (typeof json !== 'object') {
                console.log(`Reporter output is not valid JSON: ${json}`);
                process.exit(1);
            }

            assert.strictEqual(json.stats.suites, 2);
            assert.strictEqual(json.stats.tests, 2);
            assert.strictEqual(json.stats.passes, 2);
            assert(json.stats.duration < 6, `Duration is too long: ${json.stats.duration}`);
        });
