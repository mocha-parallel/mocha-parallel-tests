import { Thread, ThreadOptions } from '../thread';
import { WorkerThread } from './thread/worker';
import { ProcessThread } from './thread/process';

export type ThreadFactory = (file: string, options: ThreadOptions) => Thread;

export const getThread: ThreadFactory = (file, options) => {
  try {
    require('worker_threads');
    return new WorkerThread(/* file, options */);
  } catch (ex) {
    return new ProcessThread(file, options);
  }
}
