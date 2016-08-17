/**
 * Important thing is that no event is fired until `end` happens.
 * This is because of `retry` option which appeared in 0.2 version
 * 
 * In fact `retry` changes everything:
 * in 0.1 mocha-parallel-tests could emit events as soon as they appear.
 * The only limitation is some kind of `currently being executed file`, i.e.
 * we can't emit events in the middle of another test file being processed
 *
 * In 0.2 `retry` options appears and error can happen after 2 successful tests in one suite.
 * Also by this time other files could've finished executing so it's safe to show their events
 * So `mocha-parallel-tests` waits for `end` event and emits accumulated events then
 */
'use strict';

import path from 'path';
import debug from 'debug';
import Mocha from 'mocha';
import customRunner from './runner';
import {stdStreamsEmitter} from './watcher';

const debugLog = debug('mocha-parallel-tests');
let testsFinished = 0;
let failsOccured = 0;
let UserReporter;

customRunner.on('end', failsOccured => {
    // wait for reporter to finish its operations
    process.nextTick(() => process.exit(failsOccured));
});

// save original standard streams methods
// because lib/watcher.js overwites them
const originalWrites = {
    stderr: process.stderr.write.bind(process.stderr),
    stdout: process.stdout.write.bind(process.stdout)
};

// some console.logs are fired before instance of Reporter is created
// so it's better to have some kind of hash table with intercepted messages
const stdMessagesMap = new Map;
stdStreamsEmitter.on('message', function (data) {
    if (!stdMessagesMap.has(data.file)) {
        stdMessagesMap.set(data.file, []);
    }

    const fileMessages = stdMessagesMap.get(data.file);
    fileMessages.push({
        streamName: data.streamName,
        message: data.message,
        timestamp: Date.now()
    });

    stdMessagesMap.set(data.file, fileMessages);
});

const setUserReporter = options => {
    options.reporterName = options.reporterName || 'spec';

    try {
        UserReporter = require(`mocha/lib/reporters/${options.reporterName}`);
    } catch (evt) {
        try {
            UserReporter = require(options.reporterName);
        } catch (evt) {
            // console.log('Please use existing reporter');
            return;
        }
    }

    UserReporter = new UserReporter(customRunner, options);
};

class MochaParallelTests extends Mocha.reporters.Base {
    constructor(runner, options = {}) {
        super(runner);

        let testFile;
        let relativeFilePath;

        if (runner.suite.suites.length) {
            testFile = runner.suite.suites[0].file;
            relativeFilePath = path.relative(__filename, testFile);

            // if fail happens and another try is available
            // clear intercepted messages
            stdStreamsEmitter.on('fail', file => stdMessagesMap.delete(file));
        }

        if (!UserReporter) {
            setUserReporter(options);
        }

        // array events
        const eventsNotEmited = [];

        const storeEventData = (evtType, arg) => {
            debugLog(`${evtType} event fired (${relativeFilePath})`);

            eventsNotEmited.push({
                type: evtType,
                data: arg,
                timestamp: Date.now()
            });
        };

        // start queue
        customRunner.start();

        runner.on('suite', suite => storeEventData('suite', suite));
        runner.on('suite end', suite => storeEventData('suiteEnd', suite));
        runner.on('test', test => storeEventData('test', test));
        runner.on('pending', test => storeEventData('pending', test));
        runner.on('pass', test => storeEventData('pass', test));
        runner.on('test end', test => storeEventData('testEnd', test));
        
        runner.on('fail', (...args) => {
            storeEventData('fail', args);
            failsOccured++;
        });

        runner.on('failRetry', () => {
            failsOccured--;
        });

        runner.on('end', () => {
            debugLog(`end event fired (${relativeFilePath})`);

            // combine stored events and intercepted messages
            const allEvents = [];

            // first append all runner events
            eventsNotEmited.forEach((eventData, index) => {
                allEvents.push({
                    type: 'runnerEvent',
                    payload: {
                        type: eventData.type,
                        data: eventData.data
                    },
                    meta: {
                        index,
                        timestamp: eventData.timestamp
                    }
                });
            });

            // then append all standard streams messages
            (stdMessagesMap.get(testFile) || []).forEach((data, index) => {
                allEvents.push({
                    type: 'stdStreamMessage',
                    payload: {
                        streamName: data.streamName,
                        message: data.message
                    },
                    meta: {
                        index,
                        timestamp: data.timestamp
                    }
                });
            });

            // sort all events by timestamp and re-emit
            allEvents.sort((a, b) => {
                const timestampDiff = a.meta.timestamp - b.meta.timestamp;

                if (timestampDiff) {
                    return timestampDiff;
                }

                const aEventWeight = (a.type === 'runnerEvent') ? 1 : 0;
                const bEventWeight = (b.type === 'runnerEvent') ? 1 : 0;
                const weightDiff = aEventWeight - bEventWeight;

                if (weightDiff) {
                    return weightDiff;
                }

                return a.meta.index - b.meta.index;
            }).forEach(eventData => {
                if (eventData.type === 'runnerEvent') {
                    const key = eventData.payload.type;

                    try {
                        customRunner[key](eventData.payload.data);
                    } catch (evt) {
                        // pass
                    }
                } else if (eventData.type === 'stdStreamMessage') {
                    originalWrites[eventData.payload.streamName](eventData.payload.message);
                }
            });

            testsFinished++;

            if (testsFinished === options.testsLength) {
                customRunner.end(failsOccured);
            }
        });
    }
}

export default MochaParallelTests;
