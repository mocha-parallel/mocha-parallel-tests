import { Thread } from '../../thread';

export class WorkerThread implements Thread {
  // private file: string;
  // private options: ThreadOptions;

  // constructor(file: string, options: ThreadOptions) {
  //   // this.file = file;
  //   // this.options = options;
  // }

  run() {
    return Promise.reject(new Error('NOT_IMPLEMENTED'));
  }
}
