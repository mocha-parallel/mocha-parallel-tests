import {
  IHook as MochaHook,
  ISuite as MochaSuite,
  ITest as MochaTest,
} from 'mocha';

import { RUNNABLE_IPC_PROP, SUBPROCESS_RETRIED_SUITE_ID } from './config';

export interface IMochaParallelTestsRunnerObject {
  [RUNNABLE_IPC_PROP]: string;
}

export interface IRetriedTest extends ITest {
  [SUBPROCESS_RETRIED_SUITE_ID]: string;
}

export interface IHook extends MochaHook, IMochaParallelTestsRunnerObject {}

export interface ISuite extends MochaSuite, IMochaParallelTestsRunnerObject {
  suites: ISuite[];
  tests: ITest[];
}

export interface ITest extends MochaTest, IMochaParallelTestsRunnerObject {}

export interface ISubprocessRunnerMessage {
  data: any;
  event: string;
  type: 'runner';
}

export interface ISubprocessOutputMessage {
  event: undefined;
  data: Buffer;
  type: 'stdout' | 'stderr';
}

export interface ISubprocessSyncedData {
  results: string;
  retries: string;
}

export interface ISubprocessResult {
  code: number;
  file: string;
  events: Array<ISubprocessRunnerMessage | ISubprocessOutputMessage>;
  execTime: number;
  syncedSubprocessData?: ISubprocessSyncedData;
}

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
