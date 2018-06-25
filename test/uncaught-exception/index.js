#!/usr/bin/env node

const assert = require('assert');
const sinon = require('sinon');

const MochaParallelTests = require('../../dist/main/mocha').default;
const { setProcessExitListeners } = require('../../dist/util');
const SilentReporter = require('../util/silent-reporter');

setProcessExitListeners();

const onRunnerEnd = sinon.fake();
const onTestEnd = sinon.fake();
const mocha = new MochaParallelTests;
mocha.reporter(SilentReporter);
mocha.addFile(`${__dirname}/index.spec.js`);

mocha.run()
    .on('end', onRunnerEnd)
    .on('test end', onTestEnd);

process.on('exit', () => {
    assert.strictEqual(onRunnerEnd.callCount, 1, `runner "end" event occured wrong number of times: ${onRunnerEnd.callCount}`);
    assert.strictEqual(onTestEnd.callCount, 4, `runner "test end" event occured wrong number of times: ${onTestEnd.callCount}`);
});
