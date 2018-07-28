#!/usr/bin/env node

const assert = require('assert');
const { writeFileSync } = require('fs');
const { resolve } = require('path');
const MochaParallelTests = require('../../dist/main/mocha').default;

const counterFilePath = resolve(__dirname, 'counter.json');
const reporterPath = resolve(__dirname, '../util/silent-reporter.js');

process.on('unhandledRejection', (reason) => {
    console.error(reason.stack);
    process.exit(1);
});

// initialize counter file
writeFileSync(counterFilePath, '[]');

const mocha = new MochaParallelTests();
mocha
    .reporter(reporterPath)
    .addFile(`${__dirname}/spec/1.spec.js`)
    .addFile(`${__dirname}/spec/2.spec.js`)
    .addFile(`${__dirname}/spec/3.spec.js`)
    .addFile(`${__dirname}/spec/4.spec.js`)
    .slow(5000)
    .setMaxParallel(2)
    .run()
    .on('end', function () {
        const pidsUsed = require(counterFilePath);
        assert.strictEqual(pidsUsed.length, 2, `Number of processes is wrong: ${pidsUsed.length}`);
    });
