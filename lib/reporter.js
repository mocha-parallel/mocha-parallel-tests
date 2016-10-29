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
import MochaBaseReporter from 'mocha/lib/reporters/base';
import {getInstance as getRunnerInstance} from './runner';
import Interceptor from './interceptor';

const RUNNER_EVENTS = [
    'suite',
    'suite end',
    'test',
    'pending',
    'pass',
    'test end',
    'fail',
    'failRetry'
];

const debugLog = debug('mocha-parallel-tests:reporter');
let testsFinished = 0;
let failsOccured = 0;

let reporterInstance;
let interceptorInstance;

class AbstractReporter extends MochaBaseReporter {
    constructor(runner, options = {}) {
        super(runner);

        this._runner = runner;
        this._options = options;

        // detect curent test file for this reporter instance
        this._detectFile();

        // set interceptor for standard stream messages
        this._setInterceptorOnce();
        if (this._testFile) {
            this._interceptor.addTestFile(this._testFile);
        }

        // create "real" reporter to output our runner events
        this._runnerWrapped = getRunnerInstance();
        this._setReporterOnce();

        // emit `start` event when reporter is ready
        this._interceptor.setFileForEventTick(this._testFile);
        this._runnerWrapped.start();

        this._listenToRunnerEvents();
    }

    _detectFile() {
        if (this._runner.suite.suites.length) {
            this._testFile = this._runner.suite.suites[0].file;
            this._relativeFilePath = path.relative(__filename, this._testFile);
        }
    }

    _setReporterOnce() {
        if (reporterInstance) {
            return;
        }

        this._options.reporterName = this._options.reporterName || 'spec';
        
        const reporterTryPaths = [
            `mocha/lib/reporters/${this._options.reporterName}`,
            this._options.reporterName,
            path.resolve(process.cwd(), this._options.reporterName)
        ];

        let UserReporter;
        for (let reporterPath of reporterTryPaths) {
            try {
                UserReporter = require(reporterPath);
                break;
            } catch (evt) {
                // pass
            }
        }

        if (!UserReporter) {
            throw new Error(`Invalid reporter "${this._options.reporterName}"`);
        }

        reporterInstance = new UserReporter(this._runnerWrapped, this._options);
    }

    _setInterceptorOnce() {
        if (!interceptorInstance) {
            interceptorInstance = new Interceptor;
        }

        this._interceptor = interceptorInstance;
    }

    _onRunnerEndEvent() {
        debugLog(`end event fired (${this._relativeFilePath})`);

        testsFinished++;
        this._interceptor.emitEventsByFile(this._testFile);

        if (testsFinished === this._options.testsLength) {
            this._interceptor.restore();
            this._runnerWrapped.emit('end', failsOccured);
        }
    }

    _listenToRunnerEvents() {
        for (let eventType of RUNNER_EVENTS) {
            this._runner.on(eventType, (...args) => {
                if (eventType === 'fail') {
                    failsOccured++;
                } else if (eventType === 'failRetry') {
                    failsOccured--;
                }

                this._interceptor.setFileForEventTick(this._testFile);

                this._runnerWrapped.emit(
                    eventType,
                    ...args
                );
            });
        }

        this._runner.on('end', () => this._onRunnerEndEvent());
    }
}

export default AbstractReporter;
