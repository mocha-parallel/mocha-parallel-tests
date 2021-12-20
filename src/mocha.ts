import {
  Hook as MochaHook,
  Suite as MochaSuite,
  Test as MochaTest,
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
