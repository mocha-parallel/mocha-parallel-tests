import { Thread, ThreadOptions, supportsWorkerThreads } from '../thread';
import { WorkerThread } from './thread/worker';
import { ProcessThread } from './thread/process';

export type ThreadFactory = (file: string, options: ThreadOptions) => Thread;

export const getThread: ThreadFactory = (file, options) => {
  return supportsWorkerThreads()
    ? new WorkerThread(/* file, options */)
    : new ProcessThread(file, options);
}
