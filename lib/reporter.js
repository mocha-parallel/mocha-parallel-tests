'use strict';

var Mocha = require('mocha');
var CustomRunner = require('./runner');
var Queue = require('./queue');
var debug = require('debug')('mocha-parallel-tests');

function MochaParallelTests(runner, options) {
    var Base = Mocha.reporters.Base;
    var UserReporter = require('mocha/lib/reporters/' + (options.reporterName || 'spec'));
    var customRunner = new CustomRunner;
    var queue = new Queue;

    UserReporter = new UserReporter(customRunner);

    Base.call(this, runner);

    var events = [];
    var isRunned = false;
    var isRunning = false;

    // if queue is free and this test not runned
    if (!queue.inProcess() && !isRunned) {
        queue.start();
        isRunning = true;
    } else {
        queue.on('free', function () {
            queue.start();
            isRunning = true;
        });
    }

    runner.on('start', function() {
        debug('start');
        if (isRunning) {
            console.log('start isRunning')
            customRunner.start();
        } else {
            console.log('start push')
            events.push({start: {}});
        }
    });

    runner.on('suite', function(suite) {
        debug('suite');
        if (isRunning) {
            customRunner.suite(suite);
        } else {
            events.push({suite: suite});
        }
    });

    runner.on('suite end', function(suite) {
        debug('suite end');
        if (isRunning) {
            customRunner.suiteEnd(suite);
        } else {
            events.push({'suiteEnd': suite});
        }
    });

    runner.on('pass', function(test) {
        debug('pass');
        if (isRunning) {
            customRunner.pass(test);
        } else {
            events.push({'pass': test});
        }
    });

    runner.on('fail', function(test, err) {
        debug('fail');
        if (isRunning) {
            customRunner.fail(arguments);
        } else {
            events.push({'fail': arguments});
        }
    });

    runner.on('end', function() {
        debug('end');
        if (isRunning) {
            isRunned = true;
            queue.end();
            if (events.length) {
                run();
            }
            console.log('end isRunning')
            customRunner.end();
        } else if (queue.inProcess() && !isRunned) {
            console.log('end push')
            events.push({'end': {}});
            queue.on('free', run);
        }
    });

    function run () {
        console.log('run start');
        events.forEach(function (eventData, type) {
            var key = Object.keys(eventData)[0];
            customRunner[key](eventData[key]);
        });

        isRunned = true;
        console.log('run end')
        queue.end();
    }
}

module.exports = MochaParallelTests;