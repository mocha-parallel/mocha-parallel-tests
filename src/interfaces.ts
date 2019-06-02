import {
  IHook as MochaHook,
  ISuite as MochaSuite,
  ITest as MochaTest,
} from 'mocha';

import { RUNNABLE_IPC_PROP, SUBPROCESS_RETRIED_SUITE_ID } from './config';

export interface RetriedTest extends Test {
  [SUBPROCESS_RETRIED_SUITE_ID]: string;
}

// eslint-disable-next-line @typescript-eslint/prefer-interface
export type MochaParallelTestsRunnerObject = {
  [RUNNABLE_IPC_PROP]: string;
}

export type Hook = MochaHook & MochaParallelTestsRunnerObject;

export type Suite = MochaSuite & MochaParallelTestsRunnerObject & {
  suites: Suite[];
  tests: Test[];
}

export type Test = MochaTest & MochaParallelTestsRunnerObject;

export interface SubprocessRunnerMessage {
  data: any;
  event: string;
  type: 'runner';
}

export interface SubprocessOutputMessage {
  event: undefined;
  data: Buffer;
  type: 'stdout' | 'stderr';
}

export interface SubprocessSyncedData {
  results: string;
  retries: string;
}

export interface SubprocessResult {
  code: number;
  file: string;
  events: (SubprocessRunnerMessage | SubprocessOutputMessage)[];
  execTime: number;
  syncedSubprocessData?: SubprocessSyncedData;
}

export interface CLIReporterOptions {
  [key: string]: string | boolean;
}

export interface CLICompilers {
  compilers: string[];
  extensions: string[];
}

export type Task = () => Promise<any>;
export interface TaskOutput<T> {
  task: Task;
  output?: T;
}
