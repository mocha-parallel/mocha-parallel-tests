#!/usr/bin/env node

'use strict';

const assert = require('assert');
const MochaParallelTests = require('../../dist/main/mocha').default;
const { setProcessExitListeners } = require('../../dist/util');
const SilentReporter = require('../util/silent-reporter');

setProcessExitListeners();

const mocha = new MochaParallelTests;
mocha.addFile(`${__dirname}/tests/test.js`)
    .addFile(`${__dirname}/tests/test1.js`)
    .timeout(10000)
    .grep('grep')
    .reporter(SilentReporter);

mocha.run().on('end', function () {
    assert.strictEqual(this.stats.passes, 3);
});
