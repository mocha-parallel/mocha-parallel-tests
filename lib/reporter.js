/**
 * Important thing is that no event is fired until `end` happens.
 * This is because of `retry` option which appeared in 0.2 version
 * 
 * In fact `retry` changes everything:
 * in 0.1 mocha-parallel-tests could emit events as soon as they appear.
 * The only limitation is some king of `currently being executed file`, i.e.
 * we can't emit events in the middle of another test file being processed
 *
 * In 0.2 `retry` options appears and error can happen after 2 successful tests in one suite.
 * Also by this time other files could've finished executing so it's safe to show their events
 * So `mocha-parallel-tests` waits for `end` event and emits accumulated events then
 */
'use strict';

var path = require('path');
var Mocha = require('mocha');
var CustomRunner = require('./runner');
var watcher = require('./watcher');
var debug = require('debug')('mocha-parallel-tests');
var events = require('events');

var customRunner = new CustomRunner;
var testsFinished = 0;
var UserReporter;

// save original standard streams methods
// because lib/watcher.js overwites them
var originalWrites = {
    stderr: process.stderr.write.bind(process.stderr),
    stdout: process.stdout.write.bind(process.stdout)
};

// some console.logs are fired before instance of Reporter is created
// so it's better to have some king of map with intercepted messages
var stdMessagesMap = Object.create(null);
watcher.stdStreamsEmitter.on('message', function (data) {
    stdMessagesMap[data.file] = stdMessagesMap[data.file] || [];

    stdMessagesMap[data.file].push({
        streamName: data.streamName,
        message: data.message,
        timestamp: Date.now()
    });
});

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
    var testFile;
    var relativeFilePath;

    if (runner.suite.suites.length) {
        testFile = runner.suite.suites[0].file;
        relativeFilePath = path.relative(__filename, testFile);

        // if fail happens and another try is available
        // clear intercepted messages
        watcher.stdStreamsEmitter.on('fail', function (file) {
            delete stdMessagesMap[file];
        });
    }

    if (!UserReporter) {
        setUserReporter(options.reporterName || 'spec');
    }

    Base.call(this, runner);

    // array events
    var eventsNotEmited = [];

    function storeEventData(evtType, arg) {
        debug(evtType + ' event fired (' + relativeFilePath + ')');

        eventsNotEmited.push({
            type: evtType,
            data: arg,
            timestamp: Date.now()
        });
    }

    // start queue
    customRunner.start();

    runner.on('suite', function(suite) {
        storeEventData('suite', suite);
    });

    runner.on('suite end', function(suite) {
        storeEventData('suiteEnd', suite);
    });

    runner.on('test', function(test) {
        storeEventData('test', test);
    });

    runner.on('pending', function(test) {
        storeEventData('pending', test);
    });

    runner.on('pass', function(test) {
        storeEventData('pass', test);
    });

    runner.on('fail', function () {
        storeEventData('fail', arguments);
    });

    runner.on('test end', function(test) {
        storeEventData('testEnd', test);
    });

    runner.on('end', function() {
        debug('end event fired (' + relativeFilePath + ')');

        // combine stored events and intercepted messages
        var allEvents = [];

        // first append all runner events
        eventsNotEmited.forEach(function (eventData, index) {
            allEvents.push({
                type: 'runnerEvent',
                payload: {
                    type: eventData.type,
                    data: eventData.data
                },
                meta: {
                    timestamp: eventData.timestamp,
                    index: index
                }
            });
        });

        // then append all standard streams messages
        (stdMessagesMap[testFile] || []).forEach(function (data, index) {
            allEvents.push({
                type: 'stdStreamMessage',
                payload: {
                    streamName: data.streamName,
                    message: data.message
                },
                meta: {
                    timestamp: data.timestamp,
                    index: index
                }
            });
        });

        // sort all events by timestamp and re-emit
        allEvents.sort(function (a, b) {
            var timestampDiff = a.meta.timestamp - b.meta.timestamp;

            if (timestampDiff) {
                return timestampDiff;
            }

            var aEventWeight = (a.type === 'runnerEvent') ? 1 : 0;
            var bEventWeight = (b.type === 'runnerEvent') ? 1 : 0;
            var weightDiff = aEventWeight - bEventWeight;

            if (weightDiff) {
                return weightDiff;
            }

            return a.meta.index - b.meta.index;
        }).forEach(function (eventData) {
            if (eventData.type === 'runnerEvent') {
                var key = eventData.payload.type;

                try {
                    customRunner[key](eventData.payload.data);
                } catch (evt) {}
            } else if (eventData.type === 'stdStreamMessage') {
                originalWrites[eventData.payload.streamName](eventData.payload.message);
            }
        });

        testsFinished++;

        if (testsFinished === options.testsLength) {
            customRunner.end();
        }
    });
}

module.exports = MochaParallelTests;
