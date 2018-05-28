import * as assert from 'assert';
import { fork } from 'child_process';
import * as CircularJSON from 'circular-json';
import * as debug from 'debug';
import * as Mocha from 'mocha';
import { resolve as pathResolve } from 'path';

import RunnerMain from './runner';
import TaskManager from './task-manager';
import {
  removeDebugArgs,
  subprocessParseReviver,
} from './util';

import { DEBUG_SUBPROCESS, SUITE_OWN_OPTIONS } from '../config';
import {
  IRetriedTest,
  ISubprocessOutputMessage,
  ISubprocessResult,
  ISubprocessRunnerMessage,
  ISubprocessTestArtifacts,
  ISuite,
} from '../interfaces';

const debugLog = debug('mocha-parallel-tests');

export default class MochaWrapper extends Mocha {
  // as any
  private files: string[];
  private isTypescriptRunMode = false;
  private maxParallel: number | undefined;
  private requires: string[] = [];
  private compilers: string[] = [];
  private exitImmediately = false;

  setTypescriptRunMode() {
    this.isTypescriptRunMode = true;
  }

  /**
   * All `--require` options should be applied for subprocesses
   */
  addRequiresForSubprocess(requires: string[]) {
    this.requires = requires;
  }

  /**
   * All `--compiler` options should be applied for subprocesses
   */
  addCompilersForSubprocess(compilers: string[]) {
    this.compilers = compilers;
  }

  setMaxParallel(maxParallel: number) {
    this.maxParallel = maxParallel;
  }

  enableExitMode() {
    this.exitImmediately = true;
  }

  run(onComplete?: (failures: number) => void): RunnerMain {
    const {
      asyncOnly,
      ignoreLeaks,
      forbidOnly,
      forbidPending,
      fullStackTrace,
      hasOnly, // looks like a private mocha API
    } = (this as any).options;

    const rootSuite = this.suite as ISuite;

    const runner = new RunnerMain(rootSuite);
    (runner as any).ignoreLeaks = ignoreLeaks !== false;
    (runner as any).forbidOnly = forbidOnly;
    (runner as any).forbidPending = forbidPending;
    (runner as any).hasOnly = hasOnly;
    (runner as any).fullStackTrace = fullStackTrace;
    (runner as any).asyncOnly = asyncOnly;

    const taskManager = new TaskManager<ISubprocessTestArtifacts>(this.maxParallel);
    for (const file of this.files) {
      const task = () => this.spawnTestProcess(file);
      taskManager.add(task);
    }

    (this as any).options.files = this.files;

    // Refer to mocha lib/mocha.js run() method for more info here
    // @ts-ignore
    const reporter = new this._reporter(
      runner,
      (this as any).options,
    );

    // emit `start` and `suite` events
    // so that reporters can record the start time
    runner.emitStartEvents();

    taskManager.runAvailableTasks();

    taskManager.on('taskFinished', (testResults) => {
      const retriedTests: IRetriedTest[] = [];

      this.addSubprocessSuites(testResults);
      retriedTests.push(...this.extractSubprocessRetriedTests(testResults));

      // re-emit events
      runner.setTestResults(testResults, retriedTests);
    });

    taskManager.on('end', () => {
      const done = (failures: number) => {
        if (reporter.done) {
          reporter.done(failures, onComplete);
        } else if (onComplete) {
          onComplete(failures);
        }
      };

      runner.emitFinishEvents(done);
    });

    return runner;
  }

  private findRootData(testArtifacts: ISubprocessTestArtifacts) {
    const endRunnerMessage = testArtifacts.output.find(({ event, type }) => {
      return type === 'runner' && event === 'end';
    }) as ISubprocessRunnerMessage;

    assert(
      endRunnerMessage,
      `Subprocess for file ${testArtifacts.file} didn't send an "end" message`,
    );

    return endRunnerMessage.data;
  }

  private addSubprocessSuites(testArtifacts: ISubprocessTestArtifacts): void {
    const rootSuite = this.suite;
    const serialized = this.findRootData(testArtifacts);
    const { rootSuite: testRootSuite } = CircularJSON.parse(serialized.results, subprocessParseReviver);

    Object.assign(testRootSuite, {
      parent: rootSuite,
      root: false,
    });

    rootSuite.suites.push(testRootSuite);
  }

  private extractSubprocessRetriedTests(testArtifacts: ISubprocessTestArtifacts): IRetriedTest[] {
    const serialized = this.findRootData(testArtifacts);
    const { retriesTests } = CircularJSON.parse(serialized.retries, subprocessParseReviver);

    return retriesTests as IRetriedTest[];
  }

  private spawnTestProcess(file: string): Promise<ISubprocessResult> {
    return new Promise((resolve) => {
      const extension = this.isTypescriptRunMode ? 'ts' : 'js';
      const runnerPath = pathResolve(__dirname, `../subprocess/runner.${extension}`);
      const resolvedFilePath = pathResolve(file);

      const forkArgs: string[] = ['--test', resolvedFilePath];
      for (const option of SUITE_OWN_OPTIONS) {
        const suiteProp = `_${option}`;
        forkArgs.push(`--${option}`, this.suite[suiteProp]);
      }

      for (const requirePath of this.requires) {
        forkArgs.push('--require', requirePath);
      }

      for (const compilerPath of this.compilers) {
        forkArgs.push('--compilers', compilerPath);
      }

      if ((this as any).options.delay) {
        forkArgs.push('--delay');
      }

      if (this.exitImmediately) {
        forkArgs.push('--exit');
      }

      const test = fork(runnerPath, forkArgs, {
        // otherwise `--inspect-brk` and other params will be passed to subprocess
        execArgv: process.execArgv.filter(removeDebugArgs),
        stdio: ['ipc'],
      });

      const executable = this.isTypescriptRunMode ? 'ts-node' : 'node';
      debugLog('Process spawned. You can run it manually with this command:');
      debugLog(`${executable} ${runnerPath} ${forkArgs.concat([DEBUG_SUBPROCESS.argument]).join(' ')}`);

      const output: Array<ISubprocessOutputMessage | ISubprocessRunnerMessage> = [];
      const startedAt = Date.now();

      test.on('message', function onMessageHandler({ event, data }) {
        output.push({
          data,
          event,
          type: 'runner',
        });
      });

      test.stdout.on('data', function onStdoutData(data: Buffer) {
        output.push({
          data,
          event: undefined,
          type: 'stdout',
        });
      });

      test.stderr.on('data', function onStderrData(data: Buffer) {
        output.push({
          data,
          event: undefined,
          type: 'stderr',
        });
      });

      test.on('close', (code) => {
        debugLog(`Runner exited with code ${code}`);

        resolve({
          execTime: Date.now() - startedAt,
          file,
          output,
        });
      });
    });
  }
}
