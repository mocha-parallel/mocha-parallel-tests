import * as assert from 'assert';
import * as CircularJSON from 'circular-json';
import * as debug from 'debug';
import * as Mocha from 'mocha';
import { resolve as pathResolve } from 'path';

import ProcessPool from './process-pool';
import RunnerMain from './runner';
import TaskManager from './task-manager';
import {
  subprocessParseReviver,
} from './util';

import { SUITE_OWN_OPTIONS } from '../config';
import {
  IRetriedTest,
  ISubprocessOutputMessage,
  ISubprocessResult,
  ISubprocessRunnerMessage,
  ISubprocessSyncedData,
  ISuite,
} from '../interfaces';

const debugLog = debug('mocha-parallel-tests');

export default class MochaWrapper extends Mocha {
  private pool = new ProcessPool();
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
    this.pool.setMaxParallel(maxParallel);
  }

  enableExitMode() {
    this.exitImmediately = true;
    return this;
  }

  run(onComplete?: (failures: number) => void): RunnerMain {
    const {
      asyncOnly,
      ignoreLeaks,
      forbidOnly,
      forbidPending,
      fullStackTrace,
      hasOnly, // looks like a private mocha API
    } = this.options;

    const rootSuite = this.suite as ISuite;

    const runner = new RunnerMain(rootSuite);
    runner.ignoreLeaks = ignoreLeaks !== false;
    runner.forbidOnly = forbidOnly;
    runner.forbidPending = forbidPending;
    runner.hasOnly = hasOnly;
    runner.fullStackTrace = fullStackTrace;
    runner.asyncOnly = asyncOnly;

    const taskManager = new TaskManager<ISubprocessResult>(this.maxParallel);
    for (const file of this.files) {
      const task = () => this.spawnTestProcess(file);
      taskManager.add(task);
    }

    this.options.files = this.files;

    // Refer to mocha lib/mocha.js run() method for more info here
    const reporter = new (this as any)._reporter(
      runner,
      this.options,
    );

    // emit `start` and `suite` events
    // so that reporters can record the start time
    runner.emitStartEvents();
    taskManager.execute();

    taskManager
      .on('taskFinished', (testResults: ISubprocessResult) => {
        const {
          code,
          execTime,
          events,
          file,
          syncedSubprocessData,
        } = testResults;

        debugLog(`File execution finished: ${file}`);
        // tslint:disable-next-line:max-line-length
        debugLog(`Has synced data: ${Boolean(syncedSubprocessData)}, number of events: ${events.length}, execution time: ${execTime}`);

        const retriedTests: IRetriedTest[] = [];

        if (syncedSubprocessData) {
          this.addSubprocessSuites(testResults);
          retriedTests.push(...this.extractSubprocessRetriedTests(testResults));
        }

        runner.reEmitSubprocessEvents(testResults, retriedTests);

        const hasEndEvent = events.find((event) => event.type === 'runner' && event.event === 'end');
        if (!hasEndEvent && code !== 0) {
          process.exit(code);
        }
      })
      .on('end', () => {
        debugLog('All tests finished processing');

        const done = (failures: number) => {
          if (reporter.done) {
            reporter.done(failures, onComplete);
          } else if (onComplete) {
            onComplete(failures);
          }
        };

        runner.emitFinishEvents(done);
        this.pool.destroyAll();
      });

    return runner;
  }

  private addSubprocessSuites(testArtifacts: ISubprocessResult): void {
    const rootSuite = this.suite;
    const serialized = testArtifacts.syncedSubprocessData!;
    const { rootSuite: testRootSuite } = CircularJSON.parse(serialized.results, subprocessParseReviver);

    Object.assign(testRootSuite, {
      parent: rootSuite,
      root: false,
    });

    rootSuite.suites.push(testRootSuite);
  }

  private extractSubprocessRetriedTests(testArtifacts: ISubprocessResult): IRetriedTest[] {
    const serialized = testArtifacts.syncedSubprocessData!;
    const { retriesTests } = CircularJSON.parse(serialized.retries, subprocessParseReviver);

    return retriesTests as IRetriedTest[];
  }

  private spawnTestProcess(file: string): Promise<ISubprocessResult> {
    return new Promise<ISubprocessResult>(async (resolve) => {
      const resolvedFilePath = pathResolve(file);

      const testOptions: {[key: string]: any} = { test: resolvedFilePath };

      for (const option of SUITE_OWN_OPTIONS) {
        const propValue = this.suite[option]();
        // bail is undefined by default, we need to somehow pass its value to the subprocess
        testOptions[option] = propValue === undefined ? false : propValue;
      }

      for (const requirePath of this.requires) {
        testOptions.require = requirePath;
      }

      testOptions.compilers = this.compilers || [];

      if (this.options.delay) {
        testOptions.delay = true;
      }

      if (this.options.grep) {
        testOptions.grep = this.options.grep.toString();
      }

      if (this.exitImmediately) {
        testOptions.exit = true;
      }

      if (this.options.fullStackTrace) {
        testOptions.fullStackTrace = true;
      }

      let test;
      try {
        test = await this.pool.getOrCreate(this.isTypescriptRunMode);
      } catch (e) {
        throw e;
      }

      test.send(JSON.stringify({ type: 'start', testOptions }));

      const events: Array<ISubprocessOutputMessage | ISubprocessRunnerMessage> = [];
      let syncedSubprocessData: ISubprocessSyncedData | undefined;
      const startedAt = Date.now();

      const clean = () => {
        test.removeListener('message', onMessageHandler);
        test.stdout.removeListener('data', onStdoutData);
        test.stderr.removeListener('data', onStderrData);
        test.removeListener('close', onClose);
        test.destroy();
      };

      const onMessageHandler = ({ event, data }: { event: string, data: any }) => {
        if (event === 'sync') {
          syncedSubprocessData = data;
        } else if (event === 'end') {
          clean();
          resolve({
            code: data.code || 0,
            events,
            execTime: Date.now() - startedAt,
            file,
            syncedSubprocessData,
          });
        } else {
          assert(event);
          events.push({
            data,
            event,
            type: 'runner',
          });
        }
      };

      const onStdoutData = (data: Buffer) => {
        events.push({
          data,
          event: undefined,
          type: 'stdout',
        });
      };

      const onStderrData = (data: Buffer) => {
        events.push({
          data,
          event: undefined,
          type: 'stderr',
        });
      };

      const onClose = (code: number) => {
        debugLog(`Process for ${file} exited with code ${code}`);

        resolve({
          code,
          events,
          execTime: Date.now() - startedAt,
          file,
          syncedSubprocessData,
        });
      };

      test.on('message', onMessageHandler);
      test.stdout.on('data', onStdoutData);
      test.stderr.on('data', onStderrData);
      test.on('close', onClose);
    });
  }
}
