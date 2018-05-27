#!/usr/bin/env node

const MochaParallelTests = require('../../dist/main/mocha').default;
const mocha = new MochaParallelTests;

const timings = new Set();

mocha
    // the first test will be passed after few milliseconds
    .addFile(`${__dirname}/tests/log1.js`)
    // the second test will be passed after 3 seconds
    .addFile(`${__dirname}/tests/log2.js`)
    .timeout(5000)
    .run()
    // suite end time of each test should be not the same
    .on('suite end', () => timings.add((new Date()).getSeconds()))
    .on('end', () => {
        if (timings.size === 1) {
            console.error('Reporter prints tests log after all tests are finished, instead of after each test');
            process.exit(1);
        }
    });
