import {
  IHook as MochaHook,
  ISuite as MochaSuite,
  ITest as MochaTest,
} from 'mocha';

import { RUNNABLE_MESSAGE_CHANNEL_PROP, SUBPROCESS_RETRIED_SUITE_ID } from './config';

export interface MochaParallelTestsRunnerObject {
  [RUNNABLE_MESSAGE_CHANNEL_PROP]: string;
}

export interface RetriedTest extends Test {
  [SUBPROCESS_RETRIED_SUITE_ID]: string;
}

export interface Hook extends MochaHook, MochaParallelTestsRunnerObject {}

export interface Suite extends MochaSuite, MochaParallelTestsRunnerObject {
  suites: Suite[];
  tests: Test[];
}

export interface Test extends MochaTest, MochaParallelTestsRunnerObject {}

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
