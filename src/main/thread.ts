import debug from 'debug';
import { Debugger } from 'debug';

import { ProcessThread } from './thread/process';
import { Thread, ThreadOptions, supportsWorkerThreads } from '../thread';

export type ThreadFactory = (file: string, options: ThreadOptions) => Thread;

const getWorkerThread = (file: string, debugLog: Debugger, options: ThreadOptions) => {
  // we can't ES6-import this because older versions of node will throw exceptions
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { WorkerThread } = require('./thread/worker');
  return new WorkerThread(file, debugLog, options) as Thread;
}

export const getThread: ThreadFactory = (file, options) => {
  return supportsWorkerThreads()
    ? getWorkerThread(file, debug('mocha-parallel-tests:worker-thread'), options)
    : new ProcessThread(file, debug('mocha-parallel-tests:worker-thread'), options);
}
