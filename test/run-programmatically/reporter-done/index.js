#!/usr/bin/env node

'use strict';

const assert = require('assert');
const Mocha = require('mocha');
const MochaParallelTests = require('../../../dist/api.js');

const mocha = new MochaParallelTests;
let doneExecuted = false;

class Reporter extends Mocha.reporters.Base {
    done(failsOccured, fn) {
        doneExecuted = true;
        fn && fn(failsOccured);
    }
}

mocha
    .reporter(Reporter)
    .addFile(`${__dirname}/../_spec/parallel1.js`)
    .addFile(`${__dirname}/../_spec/parallel2.js`)
    .slow(8000)
    .timeout(10000)
    .run();

process.on('exit', () => {
    assert(doneExecuted, 'reporter.done() has not been executed');
});
