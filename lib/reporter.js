'use strict';

var Mocha = require('mocha');
var CustomRunner = require('./runner');
var debug = require('debug')('mocha-parallel-tests');

function MochaParallelTests(runner, options) {
    var Base = Mocha.reporters.Base;
    var UserReporter = require('mocha/lib/reporters/' + (options.reporterName || 'spec'));
    var customRunner = new CustomRunner;

    UserReporter = new UserReporter(customRunner);

    var failures = [];
    var passes = [];
    var suites = [];

    Base.call(this, runner);

    runner.on('suite', function(suite) {
        debug('suite');
        suites.push(suite);
    });

    runner.on('pass', function(test) {
        debug('pass');
        passes.push(test);
    });

    runner.on('fail', function(test) {
        debug('fail');
        failures.push(test);
    });

    runner.on('end', function() {
        debug('end');
        customRunner.start();

        suites.forEach(function (suite) {
            customRunner.suite(suite);
        });

        passes.forEach(function (test) {
            customRunner.pass(test);
        });

        failures.forEach(function (test) {
            customRunner.fail(test);
        });

        customRunner.end();
    });
}

module.exports = MochaParallelTests;