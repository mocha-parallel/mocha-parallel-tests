import * as assert from 'assert';
import * as CircularJSON from 'circular-json';
import * as Mocha from 'mocha';
import { IRunner, reporters } from 'mocha';
import * as yargs from 'yargs';

import {
  DEBUG_SUBPROCESS,
  RUNNABLE_IPC_PROP,
  SUBPROCESS_RETRIED_SUITE_ID,
} from '../config';
import {
  IHook,
  ISuite,
  ITest,
} from '../interfaces';

import { SUITE_OWN_OPTIONS } from '../config';
import {
  applyCompilers,
  applyDelay,
  applyGrepPattern,
  applyNoTimeouts,
  applyRequires,
  applyTimeouts,
} from '../util';

import IPC from './ipc';
import { getMessageId } from './util';

import applyExit from './options/exit';
import applyFullTrace from './options/full-trace';

const argv = yargs
  .boolean('bail')
  .option('compilers', {
    array: true,
    default: [],
  })
  .boolean('delay')
  .string('grep')
  .boolean('enableTimeouts')
  .option('exit', {
    boolean: true,
  })
  .option('full-trace', {
    boolean: true,
  })
  .number('slow')
  .option('test', {
    demandOption: true,
    string: true,
  })
  .option('require', {
    array: true,
    default: [],
  })
  .number('retries')
  .number('timeout')
  .parse(process.argv);

const debugSubprocess = argv[DEBUG_SUBPROCESS.yargs];
const ipc = new IPC();

class Reporter extends reporters.Base {
  /**
   * If `--retries N` option is specified runner can emit `test` events
   * multiple times for retried test cases. These test cases do not exist
   * if the final root suite structure, so we need to store them and return
   * to the main process after the end
   */
  private runningTests = new Set<ITest>();
  private rootSuite: ISuite;
  private currentTestIndex: number | null = null;
  private eventsCounter = 0;

  constructor(runner: IRunner) {
    super(runner);
    this.rootSuite = runner.suite as ISuite;

    runner.on('waiting', this.onRunnerWaiting);
    runner.on('start', this.onRunnerStart);
    runner.on('end', this.onRunnerEnd);

    runner.on('suite', this.onRunnerSuiteStart);
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

  private onRunnerSuiteStart = (suite: ISuite) => {
    const id = getMessageId('suite', suite, this.eventsCounter);
    suite[RUNNABLE_IPC_PROP] = id;

    this.notifyParent('suite', { id });
    this.eventsCounter += 1;
  }

  private onRunnerSuiteEnd = (suite: ISuite) => {
    this.notifyParent('suite end', {
      id: suite[RUNNABLE_IPC_PROP],
    });
  }

  private onRunnerWaiting = (/* rootSuite: ISuite */) => {
    this.notifyParent('waiting');
  }

  private onTestStart = (test: ITest) => {
    const id = getMessageId('test', test, this.eventsCounter);
    test[RUNNABLE_IPC_PROP] = id;

    // this test is running for the first time, i.e. no retries for it have been executed yet
    if (this.currentTestIndex === null) {
      const currentTestIndex = test.parent.tests.indexOf(test);
      assert(currentTestIndex !== -1, 'Could not find the test in the suite\'s tests');

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

  private onTestEnd = (test: ITest) => {
    this.runningTests.delete(test);
    this.currentTestIndex = null;

    this.notifyParent('test end', {
      id: test[RUNNABLE_IPC_PROP],
    });
  }

  private onRunnerPass = (test: ITest) => {
    this.notifyParent('pass', {
      id: test[RUNNABLE_IPC_PROP],
    });
  }

  private onRunnerFail = (test: ITest, err: Error) => {
    this.notifyParent('fail', {
      err: {
        message: err.message,
        name: err.name,
        stack: err.stack,
      },
      id: test[RUNNABLE_IPC_PROP],
    });
  }

  private onRunnerPending = (test: ITest) => {
    this.notifyParent('pending', {
      id: test[RUNNABLE_IPC_PROP],
    });
  }

  private onRunnerHookStart = (hook: IHook) => {
    const id = hook[RUNNABLE_IPC_PROP] || getMessageId('hook', hook, this.eventsCounter);
    hook[RUNNABLE_IPC_PROP] = id;

    this.notifyParent('hook', { id });
    this.eventsCounter += 1;
  }

  private onRunnerHookEnd = (hook: IHook) => {
    this.notifyParent('hook end', {
      id: hook[RUNNABLE_IPC_PROP],
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
        return Object.assign({}, test, {
          [SUBPROCESS_RETRIED_SUITE_ID]: test.parent[RUNNABLE_IPC_PROP],
          parent: null,
        });
      })
      : [];

    // send the data snapshot with every event
    ipc.sendEnsureDelivered({
      data: {
        // can't use the root suite because it will not get revived in the master process
        // @see https://github.com/WebReflection/circular-json/issues/44
        results: CircularJSON.stringify({ rootSuite: this.rootSuite }),
        retries: CircularJSON.stringify({ retriesTests }),
      },
      event: 'sync',
    });

    // and then send the event
    ipc.sendEnsureDelivered({ event, data });
  }
}

const mocha = new Mocha();
mocha.addFile(argv.test);

// --compilers
applyCompilers(argv.compilers);

// --delay
applyDelay(mocha, argv.delay);

// --grep
applyGrepPattern(mocha, argv.grep);

// --enableTimeouts
applyNoTimeouts(mocha, argv.enableTimeouts);

// --exit
const onComplete = applyExit(ipc, argv.exit);

// --require
applyRequires(argv.require);

// --timeout
applyTimeouts(mocha, argv.timeout);

// --full-trace
applyFullTrace(mocha, argv['full-trace']);

// apply main process root suite properties
for (const option of SUITE_OWN_OPTIONS) {
  const suiteProp = `_${option}`;
  mocha.suite[suiteProp] = argv[option];
}

mocha.reporter(Reporter).run(onComplete);
