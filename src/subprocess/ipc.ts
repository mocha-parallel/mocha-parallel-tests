export default class Ipc {
  private handlesRunning = 0;
  private callbackRunOnExhausted: () => void;

  sendEnsureDelivered(message: any): void {
    this.handlesRunning += 1;
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
