'use strict';

var events = require('events');
var path = require('path');
var util = require('util');

var _ = require('lodash');
var Mocha = require('mocha');
var debug = require('debug')('mocha-parallel-tests');

var pendingTests = [];
var testsList = [];
var maxParallel = Number.POSITIVE_INFINITY;
var retryCount = 0;
var runners = {};
var testFilesFailes = Object.create(null);

var streams = ['stderr', 'stdout'];
var originalWrites = {};
var interceptedData = {};

var stdStreamsEmitter = new events.EventEmitter;
stdStreamsEmitter.setMaxListeners(0); // Disable EventEmitter memory leak warning

function getSuiteFile(executionStack) {
    var stackFiles = executionStack.split('\n').reduce(function (stackFiles, chunk) {
        var matches = chunk.match(/\((.+?):[\d]+:[\d]+\)/);

        if (matches && stackFiles.indexOf(matches[1]) === -1) {
            stackFiles.push(matches[1]);
        }

        return stackFiles;
    }, []);

    var intersection = _.intersection(stackFiles, testsList);
    return intersection.length ? intersection[0] : null;
}

// save stream original functions for further calls
streams.forEach(function (streamName) {
    var stream = process[streamName];
    originalWrites[streamName] = stream.write.bind(stream);

    // mute standard streams
    // also replace process.stdout.write with process.stderr.write
    // because this is current mocha behaviour
    stream.write = function () {
        var currentExecStack = new Error().stack;
        var suiteTestFile = getSuiteFile(currentExecStack, arguments[0]);
        var arg = arguments[0];

        if (suiteTestFile) {
            stdStreamsEmitter.emit('message', {
                streamName: streamName,
                file: suiteTestFile,
                message: arg
            });
        } else { // this write is from reporter
            originalWrites[streamName](arg);
        }

        return stream;
    };
});

exports.setOptions = function Watcher_setOptions(options) {
    maxParallel = options.maxParallelTests;
    retryCount = options.retryCount || 0;
};

function addTest(file, options) {
    pendingTests.push({
        file: file,
        options: options
    });

    testsList.push(file);
}

function runTests() {
    var runner;
    var test;

    while (pendingTests.length > 0) {
        if (Object.keys(runners).length === maxParallel) {
            debug('Hit maximum parallel tests running number (' + maxParallel + '), wait');
            break;
        }

        test = pendingTests.shift();

        debug('Chose test file from queue: ' + path.relative(__filename, test.file));
        testFilesFailes[test.file] = testFilesFailes[test.file] || 0;

        // create closure to save test data
        runner = (function (test) {
            debug('Run mocha test: ' + path.relative(__filename, test.file));

            var mocha = new Mocha(test.options);
            mocha.addFile(test.file);

            var runner = mocha.run();

            function onEnd() {
                debug('Test processed: ' + path.relative(__filename, test.file));
                delete runners[test.file];

                // run pending tests if any
                if (Object.keys(runners).length) {
                    runTests();
                }
            }

            function onFail(testArg) {
                if (!testArg.file) {
                    return;
                }

                testFilesFailes[test.file]++;

                // if number of fails of this file exceeds retryCount, do nothing
                // otherwise re-add this file into queue
                if (testFilesFailes[test.file] <= retryCount) {
                    var relativeFilePath = path.relative(__filename, test.file);
                    originalWrites.stderr('[' + relativeFilePath + '] try #' + testFilesFailes[test.file] + ' failed: ' + testArg.err.message + '\n');

                    // notify reporter about retry
                    runner.emit('failRetry')

                    // stop listening to `end` event
                    runner.removeListener('end', onEnd);

                    // and mock all further events
                    runner.emit = _.noop;

                    // send event to reporter constructor
                    // so that it can clear intercepted messages
                    stdStreamsEmitter.emit('fail', test.file);

                    debug('Test failed, re-run it: ' + relativeFilePath);
                    delete runners[test.file];

                    // remove test file from require.cache otherwise it won't run
                    delete require.cache[test.file];

                    // re-add test file back to queue
                    addTest(test.file, test.options);

                    // re-run pending tests
                    runTests();
                }
            }

            // delayed tests emit `waiting` event
            // however simple javascript files are executed without timeout
            // and by this time `end` event has already happened
            // we also can't subscribe to `start` event because it is synchronous
            // the only way to know does this file contain tests is `total` property of runner object
            if (runner.total) {
                runner
                    .on('end', onEnd)
                    .on('fail', onFail);
            } else {
                setImmediate(onEnd);
            }

            return runner;
        })(test);

        runners[test.file] = runner;
    }
}

exports.addTest = addTest;
exports.runTests = runTests;
exports.stdStreamsEmitter = stdStreamsEmitter;
