import { Runner } from 'mocha';
import CircularJSON from 'circular-json';

import { Test, Suite, Hook } from '../mocha';
import { getMessageId } from './util';
import { RUNNABLE_MESSAGE_CHANNEL_PROP, SUBPROCESS_RETRIED_SUITE_ID } from '../config';
import MessageChannel from './message-channel';
import { Snapshot, ReporterNotification } from '../message-channel';

export interface ReporterConstructor {
  new(runner: Runner);
}

export type ReporterFactory = (channel: MessageChannel, debugSubprocess: boolean) => ReporterConstructor;

export const getReporterFactory: ReporterFactory = (channel, debugSubprocess) => {
  return class Reporter {
    /**
     * If `--retries N` option is specified runner can emit `test` events
     * multiple times for retried test cases. These test cases do not exist
     * if the final root suite structure, so we need to store them and return
     * to the main process after the end
     */
    private runningTests = new Set<Test>();
    private rootSuite: Suite;
    private currentTestIndex: number | null = null;
    private eventsCounter = 0;
  
    constructor(runner: Runner) {
      this.rootSuite = runner.suite as Suite;
  
      runner.on('waiting', this.onRunnerWaiting);
      runner.on('start', this.onRunnerStart);
      runner.on('end', this.onRunnerEnd);
  
      runner.on('suite', this.onRunnerSuTestart);
      runner.on('suite end', this.onRunnerSuiteEnd);
  
      runner.on('test', this.onTestStart);
      runner.on('test end', this.onTestEnd);
  
      runner.on('pass', this.onRunnerPass);
      runner.on('fail', this.onRunnerFail);
      runner.on('pending', this.onRunnerPending);
  
      runner.on('hook', this.onRunnerHookStart);
      runner.on('hook end', this.onRunnerHookEnd);
    }
  
    private onRunnerStart = () => {
      this.notifyParent('start');
    }
  
    private onRunnerEnd = () => {
      this.notifyParent('end');
    }
  
    private onRunnerSuTestart = (suite: Suite) => {
      const title = suite.root ? 'root' : suite.fullTitle();
      const id = getMessageId('suite', title, this.eventsCounter);
      suite[RUNNABLE_MESSAGE_CHANNEL_PROP] = id;
  
      this.notifyParent('suite', { id });
      this.eventsCounter += 1;
    }
  
    private onRunnerSuiteEnd = (suite: Suite) => {
      this.notifyParent('suite end', {
        id: suite[RUNNABLE_MESSAGE_CHANNEL_PROP],
      });
    }
  
    private onRunnerWaiting = (/* rootSuite: Suite */) => {
      this.notifyParent('waiting');
    }
  
    private onTestStart = (test: Test) => {
      const id = getMessageId('test', test.fullTitle(), this.eventsCounter);
      test[RUNNABLE_MESSAGE_CHANNEL_PROP] = id;

      if (!test.parent) {
        throw new Error('Could not find a parent for the current test');
      }
  
      // this test is running for the first time, i.e. no retries for it have been executed yet
      if (this.currentTestIndex === null) {
        const currentTestIndex = test.parent.tests.indexOf(test);
        if (currentTestIndex === -1) {
          throw new Error('Could not find the test in the suite\'s tests');
        }
  
        this.currentTestIndex = currentTestIndex;
      } else if (!test.parent.tests.includes(test)) {
        /**
         * When mocha runs tests with `--retries` option there's a specific behaviour for events order:
         * If the test fails and `--retries` = 1, mocha emits `test`, `test`, `fail` and `test end`.
         * This means that mocha doesn't emit the "test end" event and instead just re-emits the test.
         * The issue is that the last test in the currently running suite refers to the previously run test.
         * The fix for us here is to "fix" the mocha old pointer by replacing the failed test with a new one.
         * NB: This may be a mocha issue
         */
        test.parent.tests[this.currentTestIndex] = test;
      }
  
      this.runningTests.add(test);
  
      this.notifyParent('test', { id });
      this.eventsCounter += 1;
    }
  
    private onTestEnd = (test: Test) => {
      this.runningTests.delete(test);
      this.currentTestIndex = null;
  
      this.notifyParent('test end', {
        id: test[RUNNABLE_MESSAGE_CHANNEL_PROP],
      });
    }
  
    private onRunnerPass = (test: Test) => {
      this.notifyParent('pass', {
        id: test[RUNNABLE_MESSAGE_CHANNEL_PROP],
      });
    }
  
    private onRunnerFail = (test: Test, err: Error) => {
      this.notifyParent('fail', {
        err: {
          message: err.message,
          name: err.name,
          stack: err.stack,
        },
        id: test[RUNNABLE_MESSAGE_CHANNEL_PROP],
      });
    }
  
    private onRunnerPending = (test: Test) => {
      this.notifyParent('pending', {
        id: test[RUNNABLE_MESSAGE_CHANNEL_PROP],
      });
    }
  
    private onRunnerHookStart = (hook: Hook) => {
      const id = hook[RUNNABLE_MESSAGE_CHANNEL_PROP] || getMessageId('hook', hook.title, this.eventsCounter);
      hook[RUNNABLE_MESSAGE_CHANNEL_PROP] = id;
  
      this.notifyParent('hook', { id });
      this.eventsCounter += 1;
    }
  
    private onRunnerHookEnd = (hook: Hook) => {
      this.notifyParent('hook end', {
        id: hook[RUNNABLE_MESSAGE_CHANNEL_PROP],
      });
    }
  
    private notifyParent(event: string, data = {}) {
      if (debugSubprocess) {
        // eslint-disable-next-line no-console
        console.log({ event, data });
      } else {
        this.notifyParentThroughIPC(event, data);
      }
    }
  
    private notifyParentThroughIPC(event: string, data = {}) {
      // main process needs retried tests only when it starts
      // re-emitting subprocess test results, so it's safe to
      // omit them until the "end" event
      const retriesTests = event === 'end'
        ? [...this.runningTests].map((test) => {
          if (!test.parent) {
            throw new Error('Could not find a parent for the current test');
          }

          return Object.assign({}, test, {
            [SUBPROCESS_RETRIED_SUITE_ID]: test.parent[RUNNABLE_MESSAGE_CHANNEL_PROP],
            parent: null,
          });
        })
        : [];
  
      // send the data snapshot with every event
      const snapshot: Snapshot = {
        data: {
          // can't use the root suite because it will not get revived in the master process
          // @see https://github.com/WebReflection/circular-json/issues/44
          results: CircularJSON.stringify({ rootSuite: this.rootSuite }),
          retries: CircularJSON.stringify({ retriesTests }),
        },
        event: 'sync',
      };

      channel.sendEnsureDelivered(snapshot);
  
      // and then send the event
      const reporterNotification: ReporterNotification = { event, data }
      channel.sendEnsureDelivered(reporterNotification);
    }
  }
}
