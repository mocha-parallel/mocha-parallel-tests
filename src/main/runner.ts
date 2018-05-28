import * as assert from 'assert';

// as any
// const { Runner } = require('mocha');

import { RUNNABLE_IPC_PROP, SUBPROCESS_RETRIED_SUITE_ID } from '../config';
import {
  IHook,
  IRetriedTest,
  ISubprocessTestArtifacts,
  ISuite,
  ITest,
  Runner,
} from '../interfaces';

export default class RunnerMain extends Runner {
  private rootSuite: ISuite;
  private retriedTests: IRetriedTest[] = [];
  private subprocessTestResults: ISubprocessTestArtifacts;
  private onComplete?: (failures: number) => void;

  constructor(rootSuite: ISuite) {
    super(rootSuite, 0);
    this.rootSuite = rootSuite;

    this.once('end', this.onExecutionComplete);
    this.on('fail', this.onFail);
  }

  emitStartEvents() {
    this.emit('start');
    this.emit('suite', this.rootSuite);
  }

  emitFinishEvents(onComplete) {
    this.onComplete = onComplete;
    this.emit('suite end', this.rootSuite);
    this.emit('end');

    if (this.onComplete) {
      this.onComplete(this.failures);
    }
  }

  setTestResults(
    testResults: ISubprocessTestArtifacts,
    retriedTests: IRetriedTest[],
  ) {
    this.subprocessTestResults = testResults;
    this.setRetriesTests(retriedTests);
    this.emitRestEvents();
  }

  private onFail = () => {
    this.failures++;
  }

  private onExecutionComplete = () => {
    if ((this as any).forbidOnly && (this as any).hasOnly) {
      this.failures += (this as any).stats.tests;
    }

    if ((this as any).forbidPending) {
      this.failures += (this as any).stats.pending;
    }
  }

  private setRetriesTests(tests: IRetriedTest[]) {
    for (const test of tests) {
      const suite = this.findSuiteById(test[SUBPROCESS_RETRIED_SUITE_ID]);
      assert(suite, 'Couldn\'t find retried test suite');

      test.parent = suite!;
      this.retriedTests.push(test);
    }
  }

  private findSuiteById(id: string, rootSuite: ISuite = this.rootSuite): ISuite | null {
    if (rootSuite[RUNNABLE_IPC_PROP] === id) {
      return rootSuite;
    }

    for (const suite of rootSuite.suites) {
      const inner = this.findSuiteById(id, suite);
      if (inner) {
        return inner;
      }
    }

    return null;
  }

  private findRetriedTestById(id: string): ITest | undefined {
    return this.retriedTests.find((test) => test[RUNNABLE_IPC_PROP] === id);
  }

  private findTestById(id: string, rootSuite: ISuite = this.rootSuite): ITest | null {
    for (const test of rootSuite.tests) {
      if (test[RUNNABLE_IPC_PROP] === id) {
        return test;
      }
    }

    for (const suite of rootSuite.suites) {
      const inner = this.findTestById(id, suite);
      if (inner) {
        return inner;
      }
    }

    return null;
  }

  private findHookById(id: string, rootSuite: ISuite = this.rootSuite): IHook | null {
    for (const hookType of ['_beforeEach', '_beforeAll', '_afterEach', '_afterAll']) {
      for (const hook of rootSuite[hookType]) {
        if (hook[RUNNABLE_IPC_PROP] === id) {
          return hook;
        }
      }
    }

    for (const suite of rootSuite.suites) {
      const inner = this.findHookById(id, suite);
      if (inner) {
        return inner;
      }
    }

    return null;
  }

  /**
   * Sometimes mocha "forgets" to replace the test in suite.tests
   * Example of this can be a sync test which fails twice and passes on third run
   * If the test is executed with `--retries 2` we will get this result
   */
  private findForgottenTestById(id: string, rootSuite: ISuite = this.rootSuite): ITest | null {
    if (rootSuite.ctx.test && rootSuite.ctx.test[RUNNABLE_IPC_PROP] === id) {
      return rootSuite.ctx.test as ITest;
    }

    for (const suite of rootSuite.suites) {
      const inner = this.findForgottenTestById(id, suite);
      if (inner) {
        return inner;
      }
    }

    return null;
  }

  private emitRestEvents() {
    this.emitSubprocessEvents(this.subprocessTestResults);
  }

  private emitSubprocessEvents(testArtifacts: ISubprocessTestArtifacts) {
    for (const { event, data, type } of testArtifacts.output) {
      if (type === 'runner') {
        switch (event) {
          case 'start':
          case 'end':
            // ignore these events from subprocess
            break;

          case 'waiting':
            const waitingSuite = this.findSuiteById(data.id);
            assert(waitingSuite, `Couldn't find suite by id: ${data.id}`);

            this.emit(event, waitingSuite);
            break;

          case 'suite':
          case 'suite end': {
            const suite = this.findSuiteById(data.id);
            assert(suite, `Couldn't find suite by id: ${data.id}`);

            this.emit(event, suite);
            break;
          }

          case 'test':
          case 'test end':
          case 'pending':
          case 'pass': {
            const test = this.findTestById(data.id)
              || this.findRetriedTestById(data.id)
              || this.findForgottenTestById(data.id);
            assert(test, `Couldn't find test by id: ${data.id}`);

            this.emit(event, test);
            break;
          }

          case 'fail': {
            const test = this.findTestById(data.id)
              || this.findHookById(data.id)
              || this.findForgottenTestById(data.id);
            assert(test, `Couldn't find test by id: ${data.id}`);

            this.emit(event, test, data.err);
            break;
          }

          case 'hook':
          case 'hook end': {
            const hook = this.findHookById(data.id);
            assert(hook, `Couldn't find hook by id: ${data.id}`);

            this.emit(event, hook);
            break;
          }

          default:
            throw new Error(`Unknown event: ${event}`);
        }
      } else {
        process[type].write(data);
      }
    }
  }
}
