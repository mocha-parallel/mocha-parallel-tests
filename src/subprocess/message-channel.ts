import { supportsWorkerThreads } from '../thread';

export default class MessageChannel {
  private handlesRunning = 0;
  private callbackRunOnExhausted: () => void;

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

  private onHandleFinished = (): void => {
    this.handlesRunning -= 1;

    if (this.handlesRunning === 0 && this.callbackRunOnExhausted) {
      this.callbackRunOnExhausted();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sendToParent(message: any) {
    if (supportsWorkerThreads()) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { parentPort } = require('worker_threads');
      parentPort.postMessage(message);

      this.onHandleFinished();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      process.send!(message, this.onHandleFinished);
    }
  }
}
