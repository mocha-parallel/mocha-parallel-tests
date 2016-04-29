'use strict';

import EventEmitter from 'events';
import path from 'path';
import debug from 'debug';
import Mocha from 'mocha';

const debugLog = debug('mocha-parallel-tests');
const pendingTests = [];
const testsList = [];

let maxParallel = Number.POSITIVE_INFINITY;
let retryCount = 0;
const runners = new Map;
const testFilesFailes = new Map;

const streams = ['stderr', 'stdout'];
const originalWrites = {};
const interceptedData = {};

export const stdStreamsEmitter = new EventEmitter;
stdStreamsEmitter.setMaxListeners(0); // Disable EventEmitter memory leak warning

// empty function
const noop = () => {}

/**
 * Get intersection between arrays
 * 
 * @param {Array} a
 * @param {Array} b
 * @return {Array}
 */
const intersection = (a, b) => {
    const bSet = new Set(b);
    const commonElementsSet = new Set(a.filter(x => bSet.has(x)));

    return [...commonElementsSet];
}

const getSuiteFile = executionStack => {
    const stackFiles = executionStack.split('\n').reduce((stackFiles, chunk) => {
        const matches = chunk.match(/\((.+?):[\d]+:[\d]+\)/);

        if (matches && !stackFiles.includes(matches[1])) {
            stackFiles.push(matches[1]);
        }

        return stackFiles;
    }, []);

    const commonFiles = intersection(stackFiles, testsList);
    return commonFiles.length ? commonFiles[0] : null;
};

// save stream original functions for further calls
streams.forEach(streamName => {
    const stream = process[streamName];
    originalWrites[streamName] = stream.write.bind(stream);

    // mute standard streams
    // also replace process.stdout.write with process.stderr.write
    // because this is current mocha behaviour
    stream.write = arg => {
        const currentExecStack = new Error().stack;
        const suiteTestFile = getSuiteFile(currentExecStack, arg);

        if (suiteTestFile) {
            stdStreamsEmitter.emit('message', {
                streamName,
                file: suiteTestFile,
                message: arg
            });
        } else { // this write is from reporter
            originalWrites[streamName](arg);
        }

        return stream;
    };
});

export const setOptions = options => {
    maxParallel = options.maxParallelTests;
    retryCount = options.retryCount || 0;
};

export const addTest = (file, options) => {
    pendingTests.push({file, options});
    testsList.push(file);
};

export const runTests = () => {
    let runner;
    let test;

    while (pendingTests.length) {
        if (runners.size === maxParallel) {
            debugLog(`Hit maximum parallel tests running number (${maxParallel}), wait`);
            break;
        }

        test = pendingTests.shift();

        debugLog(`Chose test file from queue: ${path.relative(__filename, test.file)}`);
        testFilesFailes.set(test.file, testFilesFailes.get(test.file) || 0);

        // create closure to save test data
        runner = (function (test) {
            debugLog(`Run mocha test: ${path.relative(__filename, test.file)}`);

            const mocha = new Mocha(test.options);
            mocha.addFile(test.file);

            const runner = mocha.run();

            function onEnd() {
                debugLog(`Test processed: ${path.relative(__filename, test.file)}`);
                runners.delete(test.file);

                // run pending tests if any
                if (runners.size) {
                    runTests();
                }
            }

            function onFail(testArg) {
                if (!testArg.file && testArg.type !== 'hook') {
                    return;
                }

                testFilesFailes.set(
                    test.file,
                    testFilesFailes.get(test.file) + 1
                );

                // if number of fails of this file exceeds retryCount, do nothing
                // otherwise re-add this file into queue
                if (testFilesFailes.get(test.file) <= retryCount) {
                    var relativeFilePath = path.relative(__filename, test.file);
                    originalWrites.stderr(`[${relativeFilePath}] try #${testFilesFailes.get(test.file)} failed: ${testArg.err.message}\n'`);

                    // notify reporter about retry
                    runner.emit('failRetry')

                    // stop listening to `end` event
                    runner.removeListener('end', onEnd);

                    // and mock all further events
                    runner.emit = noop;

                    // send event to reporter constructor
                    // so that it can clear intercepted messages
                    stdStreamsEmitter.emit('fail', test.file);

                    debugLog(`Test failed, re-run it: ${relativeFilePath}`);
                    runners.delete(test.file);

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

        runners.set(test.file, runner);
    }
};
