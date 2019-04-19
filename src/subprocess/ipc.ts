export default class Ipc {
  private handlesRunning = 0;
  private callbackRunOnExhausted: () => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendEnsureDelivered(message: any): void {
    this.handlesRunning += 1;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.send!(message, this.onHandleFinished);
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
}
