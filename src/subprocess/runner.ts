import * as CircularJSON from 'circular-json';
import * as Mocha from 'mocha';
import { IRunner, reporters } from 'mocha';
import * as yargs from 'yargs';
import applyGrepPattern from '../bin/options/grep';

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
  applyNoTimeouts,
  applyRequires,
  applyTimeouts,
  randomId,
} from '../util';

import applyExit from './options/exit';

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
  .number('slow')
  .option('require', {
    array: true,
    default: [],
  })
  .number('retries')
  .number('timeout')
  .parse(process.argv);

const debugSubprocess = argv[DEBUG_SUBPROCESS.yargs];

class Reporter extends reporters.Base {
  /**
   * If `--retries N` option is specified runner can emit `test` events
   * multiple times for retried test cases. These test cases do not exist
   * if the final root suite structure, so we need to store them and return
   * to the main process after the end
   */
  private runningTests = new Set<ITest>();
  private rootSuite: ISuite;

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
    const id = randomId();
    suite[RUNNABLE_IPC_PROP] = id;

    this.notifyParent('suite', { id });
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
    const id = randomId();
    test[RUNNABLE_IPC_PROP] = id;

    this.runningTests.add(test);
    this.notifyParent('test', { id });
  }

  private onTestEnd = (test: ITest) => {
    this.runningTests.delete(test);

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
    const id = hook[RUNNABLE_IPC_PROP] || randomId();
    hook[RUNNABLE_IPC_PROP] = id;

    this.notifyParent('hook', { id });
  }

  private onRunnerHookEnd = (hook: IHook) => {
    this.notifyParent('hook end', {
      id: hook[RUNNABLE_IPC_PROP],
    });
  }

  private notifyParent(event: string, data = {}) {
    if (debugSubprocess) {
      // tslint:disable-next-line:no-console
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
    process.send!({
      data: {
        // can't use the root suite because it will not get revived in the master process
        // @see https://github.com/WebReflection/circular-json/issues/44
        results: CircularJSON.stringify({ rootSuite: this.rootSuite }),
        retries: CircularJSON.stringify({ retriesTests }),
      },
      event: 'sync',
    });

    // and then send the event
    process.send!({ event, data });
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
const onComplete = applyExit(argv.exit);

// --require
applyRequires(argv.require);

// --timeout
applyTimeouts(mocha, argv.timeout);

// apply main process root suite properties
for (const option of SUITE_OWN_OPTIONS) {
  const suiteProp = `_${option}`;
  mocha.suite[suiteProp] = argv[option];
}

mocha.reporter(Reporter).run(onComplete);
