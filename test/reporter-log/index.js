#!/usr/bin/env node

const MochaParallelTests = require('../../dist/main/mocha').default;
const SilentReporter = require('../util/silent-reporter');

const mocha = new MochaParallelTests;
const timings = [];

mocha
    // the first test will be passed after few milliseconds
    .addFile(`${__dirname}/tests/log1.js`)
    // the second test will be passed after 3 seconds
    .addFile(`${__dirname}/tests/log2.js`)
    .timeout(3000)
    .reporter(SilentReporter)
    .run()
    // suite end time of each test should be not the same
    .on('suite end', () => timings.push((new Date()).getSeconds()))
    .on('end', () => {
        if (timings.pop() - timings[0] !== 2) {
            console.error('Should have 2s between 2 test suite end events');
            process.exit(1);
        }
    });
