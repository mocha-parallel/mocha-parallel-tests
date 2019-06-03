import { ProcessThread } from './thread/process';
import { Thread, ThreadOptions, supportsWorkerThreads } from '../thread';

export type ThreadFactory = (file: string, options: ThreadOptions) => Thread;

const getWorkerThread: ThreadFactory = (file, options) => {
  // we can't ES6-import this because older versions of node will throw exceptions
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { WorkerThread } = require('./thread/worker');
  return new WorkerThread(file, options) as Thread;
}

export const getThread: ThreadFactory = (file, options) => {
  return supportsWorkerThreads()
    ? getWorkerThread(file, options)
    : new ProcessThread(file, options);
}
