'use strict';

import EventEmitter from 'events';
import path from 'path';
import debug from 'debug';
import Mocha from 'mocha';
import RequireCacheWatcher from './utils/require-cache-watcher';

const debugLog = debug('mocha-parallel-tests:watcher');
const cacheWatcher = new RequireCacheWatcher;
const pendingTests = [];
const testsList = [];

let maxParallel = Number.POSITIVE_INFINITY;
let retryCount = 0;

const runners = new Map;
const testFilesFailes = new Map;

const originalWrites = {};

export const stdStreamsEmitter = new EventEmitter;
stdStreamsEmitter.setMaxListeners(0); // Disable EventEmitter memory leak warning

// empty function
const noop = () => {};

const getRunnerId = (testFile, suiteIndex) => {
    return `${testFile}:${suiteIndex}`;
};

const scheduleMochaRun = ({file, options, throttledCalls}) => {
    debugLog(`Run mocha test: ${path.relative(__filename, file)}`);
    const fileRunners = [];

    const stateMark = cacheWatcher.getStateMark();
    cacheWatcher.flushRequireCache(stateMark);

    const mocha = new Mocha();
    mocha.addFile(file);

    /**
     * Suites are stored inside `mocha.suite.suites` array
     * but it's populated only after mocha.run() is called.
     *
     * The fact is that when mocha.run() is called
     * it loads test files first with mocha.loadFiles()
     *
     * What mocha.loadFiles() does is: it iterates over all test files
     * and emits 3 events: "pre-require", "require" and "post-require"
     *
     * "pre-require" is somewhat intresting to us:
     * it populates hook functions needed for suite execution (before, beforeAll etc)
     *
     * "require" and "post-require" are not so much intresting but "require" requires test files
     * which leads to populating `suites` property of `mocha.suite`.
     *
     * At the same time nothing has happened to this moment, so it's safe to just stop here
     * and realize how much suites does the file have
     *
     * loadFiles() requires test files which can also require files
     * these files should be then removed from require cache
     * @see https://github.com/mmotkina/mocha-parallel-tests/issues/39
     */
    mocha.loadFiles();
    debugLog(`Suites length is ${mocha.suite.suites.length} for ${file}`);

    // stop watching require.cache changes
    const beforeTestsRunCacheStateMark = cacheWatcher.getStateMark(); 

    const onEnd = suiteIndex => {
        return () => {
            debugLog(`Test processed: ${path.relative(__filename, file)} (suite ${suiteIndex})`);

            const runnerId = getRunnerId(file, suiteIndex);
            runners.delete(runnerId);

            // run pending tests if any
            if (runners.size || pendingTests.length) {
                runTestsRecursive({options, throttledCalls});
            }
        };
    };

    const onFail = suiteIndex => {
        const runnerId = getRunnerId(file, suiteIndex);

        return testArg => {
            if (!testArg.file && testArg.type !== 'hook') {
                return;
            }

            testFilesFailes.set(
                runnerId,
                testFilesFailes.get(runnerId) + 1
            );

            // if number of fails of this file exceeds retryCount, do nothing
            // otherwise re-add this file into queue
            if (testFilesFailes.get(runnerId) <= retryCount) {
                var relativeFilePath = path.relative(__filename, file);
                originalWrites.stderr(`[${relativeFilePath}] try #${testFilesFailes.get(runnerId)} failed: ${testArg.err.message}\n`);

                // notify reporter about retry
                fileRunners[suiteIndex].emit('failRetry');

                // stop listening to `end` event
                fileRunners[suiteIndex].removeAllListeners('end');

                // and mock all further events
                fileRunners[suiteIndex].emit = noop;

                // send event to reporter constructor
                // so that it can clear intercepted messages
                stdStreamsEmitter.emit('fail', file);

                debugLog(`Test failed, re-run it: ${relativeFilePath}`);
                runners.delete(runnerId);

                // remove test file from require.cache otherwise it won't run
                delete require.cache[file];

                // re-add test file back to queue
                addTest(file);

                // re-run pending tests
                runTestsRecursive({options, throttledCalls});
            }
        };
    };

    // files without test suites have zero length of `mocha.suite.suites` array
    const testsSuites = Math.max(mocha.suite.suites.length, 1);

    if (testsSuites > 1) {
        // if file contains more than 1 test suite, options.testsLength should be increased
        // otherwise reporter doesn't know anything about this file and could emit end before
        // it should actually be emitted
        options.testsLength += testsSuites - 1;
    }

    for (let i = 0; i < testsSuites; i++) {
        /**
         * Suites are being populated by calling describe
         * Describe(), before() and after() are set via global.describe in mocha itself
         * The only way we can re-run describes is to clear cache associated with the test file
         */
        cacheWatcher.flushRequireCache(beforeTestsRunCacheStateMark);

        const mocha = new Mocha(options);
        mocha.addFile(file);

        for (let {method, args} of throttledCalls) {
            mocha[method](...args);
        }

        /**
         * This is a simple hack to let all describes inside one file run in parallel.
         * Mocha emits 3 hooks: "pre-require" to populate hooks, "require" which does nothing
         * but require(testFile) is happening under the hood and "post-require" which is also
         * useless. Luckily it's useful for us: it's possible to change suites number inside
         * of post-require handler. Using this we can set `mocha` from the 1st loop to run
         * only 1st suite, `mocha` from the 2nd loop to run 2nd etc
         */
        mocha.suite.on('post-require', () => {
            // delete all suites except the one with current index
            if (mocha.suite.suites.length) {
                mocha.suite.suites = [mocha.suite.suites[i]];
            }
        });

        const runner = mocha.run();
        fileRunners.push(runner);
    }

    fileRunners.forEach((runner, i) => {
        // delayed tests emit `waiting` event
        // however simple javascript files are executed without timeout
        // and by this time `end` event has already happened
        // we also can't subscribe to `start` event because it is synchronous
        // the only way to know does this file contain tests is `total` property of runner object
        if (runner.total) {
            runner
                .on('end', onEnd(i))
                .on('fail', onFail(i));
        } else {
            setImmediate(onEnd(i));
        }
    });

    return fileRunners;
};

const runTestsRecursive = ({options, throttledCalls}) => {
    while (pendingTests.length) {
        if (runners.size === maxParallel) {
            debugLog(`Hit maximum parallel tests running number (${maxParallel}), wait`);
            break;
        }

        const testFile = pendingTests.shift();
        const fileRunners = scheduleMochaRun({
            options,
            throttledCalls,
            file: testFile
        });

        debugLog(`Chose test file from queue: ${path.relative(__filename, testFile)}`);

        fileRunners.forEach((runner, i) => {
            const runnerId = getRunnerId(testFile, i);

            testFilesFailes.set(runnerId, testFilesFailes.get(runnerId) || 0);
            runners.set(runnerId, runner);
        });
    }
};

export const setOptions = options => {
    maxParallel = options.maxParallelTests;
    retryCount = options.retryCount || 0;
};

export const addTest = (file) => {
    pendingTests.push(file);
    testsList.push(file);
};

export const runTests = ({
    options,
    throttledCalls = []
}) => {
    cacheWatcher.start();

    runTestsRecursive({
        options,
        throttledCalls
    });
};
