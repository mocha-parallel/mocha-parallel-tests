'use strict';

var Mocha = require('mocha');
var CustomRunner = require('./runner');
var queue = require('./queue');
var debug = require('debug')('mocha-parallel-tests');
var events = require('events');

var customRunner = new CustomRunner;
var UserReporter;
var setUserReporter = function (reporter) {
    try {
        UserReporter = require('mocha/lib/reporters/' + reporter)
    } catch (evt) {
        try {
            UserReporter = require(reporter);
        } catch (evt) {
            // console.log('Please use existing reporter');
            return;
        }
    }

    UserReporter = new UserReporter(customRunner);
};

function MochaParallelTests(runner, options) {
    var Base = Mocha.reporters.Base;

    if (!UserReporter) {
        setUserReporter(options.reporterName || 'spec');
    }

    Base.call(this, runner);

    // array events
    var eventsArr = [];

    // test done
    var isFinished = false;
    // test in process
    var isRunning = false;
    // all test data
    var isDataFull = false;

    // if queue is free and task not finished start queue
    if (!queue.inProcess() && !isFinished) {
        queue.start();
        isRunning = true;
    } else {
        // if queue is busy listen 'free' event
        queue.on('free', function () {
            // if task is not done and queue is free
            if (!isFinished && !queue.inProcess()) {
                // if all events in array and they don't include suites
                if (isDataFull && eventsArr.length <= 2) {
                    return;
                }
                // if still in process of getting events
                if (!isDataFull) {
                    isRunning = true;
                }
                // start queue and emit events we already have
                queue.start();
                run();
            }
        });
    }

    // emit saved test events
    function run () {
        eventsArr.forEach(function (eventData, type) {
            var key = Object.keys(eventData)[0];

            try {
                customRunner[key](eventData[key]);
            } catch (evt) {}
        });
        // if all events saved finish test and exit queue
        if (isDataFull) {
            isFinished = true;
            queue.end();
        }
    }

    runner.on('start', function() {
        debug('start');
        if (isRunning) {
            customRunner.start();
        } else {
            eventsArr.push({start: {}});
        }
    });

    runner.on('suite', function(suite) {
        debug('suite');
        if (isRunning) {
            customRunner.suite(suite);
        } else {
            eventsArr.push({suite: suite});
        }
    });

    runner.on('suite end', function(suite) {
        debug('suite end');
        if (isRunning) {
            customRunner.suiteEnd(suite);
        } else {
            eventsArr.push({'suiteEnd': suite});
        }
    });

    runner.on('test', function(test) {
        debug('test');
        if (isRunning) {
            customRunner.test(test);
        } else {
            eventsArr.push({'test': test});
        }
    });

    runner.on('pending', function(test) {
        debug('pending');
        if (isRunning) {
            customRunner.pending(test);
        } else {
            eventsArr.push({'pending': test});
        }
    });

    runner.on('pass', function(test) {
        debug('pass');
        if (isRunning) {
            customRunner.pass(test);
        } else {
            eventsArr.push({'pass': test});
        }
    });

    runner.on('fail', function(test) {
        debug('fail');
        if (isRunning) {
            try {
                customRunner.fail(test);
            } catch (evt) {}
        } else {
            eventsArr.push({'fail': test});
        }
    });

    runner.on('test end', function(test) {
        debug('test end');
        if (isRunning) {
            customRunner.testEnd(test);
        } else {
            eventsArr.push({'testEnd': test});
        }
    });

    runner.on('end', function() {
        debug('end');
        if (isRunning) {
            isFinished = true;
            isRunning = false;
            queue.end();
            customRunner.end();
        } else {
            eventsArr.push({'end': {}});
            isDataFull = true;
        }
    });
}

module.exports = MochaParallelTests;