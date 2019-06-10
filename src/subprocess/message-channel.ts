import { supportsWorkerThreads } from '../thread';
import { MessagePort } from 'worker_threads';

type WriteableStreamType = 'stderr' | 'stdout';

export default class MessageChannel {
  private handlesRunning = 0;
  private callbackRunOnExhausted: () => void;

  constructor() {
    if (supportsWorkerThreads()) {
      // stdout/stderr messages and worker thread messages are not synchronised
      // this means that we can't rely on worker.stdout stream
      process.stdout.write = this.overrideStdStream('stdout');
      process.stderr.write = this.overrideStdStream('stderr');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendEnsureDelivered(message: any): void {
    this.handlesRunning += 1;
    this.sendToParent(message);
  }

  runOnExhausted(cb: () => void): void {
    if (this.handlesRunning) {
      this.callbackRunOnExhausted = cb;
    } else {
      cb();
    }
  }

  private getParentPort(): MessagePort {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { parentPort } = require('worker_threads');
    if (!parentPort) {
      throw new Error('Parent port is not available');
    }

    return parentPort;
  }

  private onHandleFinished = (): void => {
    this.handlesRunning -= 1;

    if (this.handlesRunning === 0 && this.callbackRunOnExhausted) {
      this.callbackRunOnExhausted();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sendToParent(message: any) {
    if (supportsWorkerThreads()) {
      const parentPort = this.getParentPort();
      parentPort.postMessage(message);

      this.onHandleFinished();
    } else {
      if (!process.send) {
        throw new Error('IPC is not available');
      }

      process.send(message, this.onHandleFinished);
    }
  }

  private overrideStdStream(stream: WriteableStreamType) {
    const originalWrite = process[stream].write.bind(process.stdout);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const overrideCallback = (data: string, ...args: any[]) => {
      const parentPort = this.getParentPort();
      parentPort.postMessage({ stream, data });

      return originalWrite(data, ...args);
    };

    return overrideCallback;
  }
}
