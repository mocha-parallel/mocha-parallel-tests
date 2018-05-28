#!/usr/bin/env node

const assert = require('assert');
const MochaParallelTests = require('../../dist/main/mocha').default;
const SilentReporter = require('../util/silent-reporter');

const mocha = new MochaParallelTests;
let suite1FinishTime;
let suite2FinishTime;

mocha
    // the first test will be passed after few milliseconds
    .addFile(`${__dirname}/tests/log1.js`)
    // the second test will be passed after 3 seconds
    .addFile(`${__dirname}/tests/log2.js`)
    .timeout(3000)
    .reporter(SilentReporter)
    .run()
    .on('suite end', (suite) => {
        if (suite.title === 'suite1') {
            suite1FinishTime = Date.now();
        } else if (suite.title === 'suite2') {
            suite2FinishTime = Date.now();
        }
    })
    // suite end time of each test should be not the same
    // .on('suite end', () => timings.push((new Date()).getSeconds()))
    .on('end', () => {
        assert(suite1FinishTime, 'Suite 1 was not finished');
        assert(suite2FinishTime, 'Suite 2 was not finished');
        
        const diffSeconds = Math.round((suite2FinishTime - suite1FinishTime) / 1000);
        assert(diffSeconds >= 2, `Should have at least 2 seconds diff between suite end events but got ${diffSeconds}`);
    });
