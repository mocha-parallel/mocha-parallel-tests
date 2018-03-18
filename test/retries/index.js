#!/usr/bin/env node

const assert = require('assert');
const MochaParallelTests = require('../../dist/main/mocha').default;
const { setProcessExitListeners } = require('../../dist/util');
const SilentReporter = require('../util/silent-reporter');

setProcessExitListeners();

const mocha = new MochaParallelTests;
mocha.reporter(SilentReporter);
mocha.suite.retries(2);
mocha.addFile(`${__dirname}/index.spec.js`);

mocha.run().on('end', function () {
    assert.strictEqual(this.stats.passes, 1, `Passes number is wrong: ${this.stats.passes}`);
    assert.strictEqual(this.stats.failures, 0, `Failures number is wrong: ${this.stats.failures}`);    
});
