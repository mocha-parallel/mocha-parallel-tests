'use strict';

var util = require('util');
var _ = require('lodash');
var Mocha = require('mocha');
var debug = require('debug')('mocha-parallel-tests');
var execQueue = require('./executing-files-queue');

var pendingTests = [];
var testsList = [];
var maxParallel = Number.POSITIVE_INFINITY;
var runners = {};

var streams = ['stderr', 'stdout'];
var originalWrites = {};
var interceptedData = {};

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
            // this is external `console.method()` call
            if (execQueue.getCurrent() === suiteTestFile) {
                // currently this test file is being processed
                // so it's time to immediately write data
                originalWrites[streamName](arg);
            } else {
                // another file is being processed
                // save data for further posting
                interceptedData[suiteTestFile] = interceptedData[suiteTestFile] || [];
                interceptedData[suiteTestFile].push({
                    streamName: streamName,
                    message: arg
                });
            }
        } else { // this write is from reporter
            originalWrites[streamName](arg);
        }

        return stream;
    };
});

// when test execution is over release all intercepted messages
// which were fired during test execution
function releaseInterceptedMessages(fileNames) {
    fileNames.forEach(function (fileName) {
        if (!interceptedData[fileName]) {
            return;
        }

        interceptedData[fileName].forEach(function (data) {
            originalWrites[data.streamName](data.message);
        });

        delete interceptedData[fileName];
    });
}

exports.setMaxParallelTests = function Watcher_setMaxParallelTests(maxParallelCount) {
    maxParallel = maxParallelCount;
};

exports.addTest = function Watcher_addTest(file, options) {
    pendingTests.push({
        file: file,
        options: options
    });

    testsList.push(file);
};

exports.runTests = function Watcher_runTests() {
    var runner;
    var test;

    while (pendingTests.length > 0) {
        if (Object.keys(runners).length === maxParallel) {
            debug('Hit maximum parallel tests running number (' + maxParallel + '), wait');
            break;
        }

        test = pendingTests.shift();
        debug('Chose test file from queue: ' + test.file);

        // create closure to save test data
        runner = (function (test) {
            debug('Run mocha test: ' + test.file);

            var mocha = new Mocha(test.options);
            mocha.addFile(test.file);

            // append file to executing files queue
            execQueue.addFile(test.file);

            var runner = mocha.run();

            function onEnd() {
                debug('Test processed: ' + test.file);
                delete runners[test.file];

                // update executing tasks queue
                var releaseTestMessages = execQueue.taskProcessed(test.file);

                releaseInterceptedMessages(releaseTestMessages);

                // run pending tests if any
                if (Object.keys(runners).length) {
                    Watcher_runTests();
                }
            }

            // delayed tests emit `waiting` event
            // however simple javascript files are executed without timeout
            // and by this time `end` event has already happened
            // we also can't subscribe to `start` event because it is synchronous
            // the only way to know does this file contain tests is `total` property of runner object
            if (runner.total) {
                runner.on('end', onEnd);
            } else {
                setImmediate(onEnd);
            }

            return runner;
        })(test);

        runners[test.file] = runner;
    }
};
