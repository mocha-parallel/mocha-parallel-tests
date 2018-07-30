#!/usr/bin/env node

'use strict';

const assert = require('assert');
const MochaParallelTests = require('../../dist/main/mocha').default;

const mocha = new MochaParallelTests;

mocha
    .addFile(`${__dirname}/tests/test.js`)
    .addFile(`${__dirname}/tests/test1.js`)
    .timeout(10000)
    .grep('grep')
    .reporter('json');

var write = process.stdout.write;
var output = '';
process.stdout.write = function(str) {
    output += str;
};

mocha.run(function() {
    process.stdout.write = write;
});

process.on('exit', () => {
    var jsonResult = JSON.parse(output);
    assert.strictEqual(jsonResult.stats.passes, 3, 'Tests number is wrong. Expected 3. Actual: '
    + jsonResult.stats.passes);
});


