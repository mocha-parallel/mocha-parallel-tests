import { EventEmitter } from 'events';
import * as Mocha from 'mocha';
import {
  IContextDefinition,
  IRunnable,
  IRunner as MochaRunner,
  ISuite as MochaSuite,
  ITest as MochaTest,
  reporters,
} from 'mocha';

import { RUNNABLE_IPC_PROP, SUBPROCESS_RETRIED_SUITE_ID } from './config';

export type IRunner = MochaRunner & EventEmitter;

export interface IContext {
  test?: ITest | IHook;
  _runnable?: ITest | IHook;
}

export interface IMochaParallelTestsRunnerObject {
  [RUNNABLE_IPC_PROP]: string;
}

export interface ITest extends MochaTest, IMochaParallelTestsRunnerObject {
  body: string;
  type: 'test';
  file: string;
}

export interface IRetriedTest extends ITest {
  [SUBPROCESS_RETRIED_SUITE_ID]: string;
}

export class BaseReporter extends reporters.Base {
  runner: IRunner;
}

export interface ISuite extends MochaSuite, IMochaParallelTestsRunnerObject {
  _beforeEach: IHook[];
  _beforeAll: IHook[];
  _afterEach: IHook[];
  _afterAll: IHook[];

  root: boolean;
  suites: ISuite[];
  tests: ITest[];
  ctx: IContext;
}

export interface IHook extends IRunnable, IMochaParallelTestsRunnerObject {
  parent: ISuite;
  ctx: IContextDefinition;
}

export interface ISubprocessRunnerMessage {
  event: string;
  data: any;
  type: 'runner';
}

export interface ISubprocessOutputMessage {
  event: undefined;
  data: Buffer;
  type: 'stdout' | 'stderr';
}

export interface ISubprocessResult {
  file: string;
  output: Array<ISubprocessRunnerMessage | ISubprocessOutputMessage>;
  execTime: number;
}

export interface ISubprocessTestArtifacts {
  file: string;
  suiteIndex: number;
  output: Array<ISubprocessRunnerMessage | ISubprocessOutputMessage>;
  execTime: number;
}

export interface IRunnerDecl {
  new(suite: ISuite, delay: number): IRunner;
}

export const Runner: IRunnerDecl = (Mocha as any).Runner;

export interface ICLIReporterOptions {
  [key: string]: string | boolean;
}

export interface ICLICompilers {
  compilers: string[];
  extensions: string[];
}

export type Task = () => Promise<any>;
export interface ITaskOutput<T> {
  task: Task;
  output?: T;
}
