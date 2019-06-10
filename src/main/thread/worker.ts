import { Debugger } from 'debug';
import { Worker } from 'worker_threads';
import { resolve } from 'path';

import { SubprocessMessage, Thread, ThreadOptions } from '../../thread';
import { SubprocessResult, SubprocessSyncedData } from '../../interfaces';
import { removeDebugArgs } from '../util';

export interface WorkerData {
  file: string;
  options: ThreadOptions;
}

export class WorkerThread implements Thread {
  private file: string;
  private log: Debugger;
  private options: ThreadOptions;
  private events: SubprocessMessage[] = [];
  private startedAt: number | undefined;
  private syncedSubprocessData: SubprocessSyncedData | undefined;

  constructor(file: string, log: Debugger, options: ThreadOptions) {
    this.file = file;
    this.log = log;
    this.options = options;
  }

  run() {
    const workerFilename = this.options.isTypescriptRunMode ? 'worker.development.js' : 'worker.js';
    const workerPath = resolve(__dirname, `../../subprocess/thread/${workerFilename}`);

    this.startedAt = Date.now();

    return new Promise<SubprocessResult>((resolve, reject) => {
      const worker = new Worker(workerPath, {
        execArgv: process.execArgv.filter(removeDebugArgs),
        stderr: true,
        stdout: true,
        workerData: this.buildWorkerData(),
      });

      // it's unsafe to listen to stderr/stdout messages from the worker thread
      // because they are asynchronous (process.stdout.isTTY = False)
      // worker.stderr.on('data', this.onStderr);
      // worker.stdout.on('data', this.onStdout);

      worker.on('message', this.onMessage);
      worker.on('error', this.onError(reject));
      worker.on('exit', this.onExit(resolve));
    });
  }

  private buildWorkerData(): WorkerData {
    return {
      file: resolve(this.file),
      options: this.options,
    };
  }

  private onMessage = ({ event, data, stream }) => {
    if (stream === 'stdout') {
      this.onStdout(data);
      return;
    }

    if (stream === 'stderr') {
      this.onStderr(data);
      return;
    }

    if (event === 'sync') {
      this.syncedSubprocessData = data;
    } else {
      this.events.push({
        data,
        event,
        type: 'runner',
      });
    }
  }

  private onStdout = (data: Buffer) => {
    this.events.push({
      data,
      event: undefined,
      type: 'stdout',
    });
  }

  private onStderr = (data: Buffer) => {
    this.events.push({
      data,
      event: undefined,
      type: 'stderr',
    });
  }

  private onError = (reject: (err: Error) => void) => (err: Error) => {
    this.log(`Error occured in subprocess: ${err.stack}`);
    reject(err);
  }

  private onExit = (resolve: (data: SubprocessResult) => void) => (code: number) => {
    this.log(`Process for ${this.file} exited with code ${code}`);

    if (!this.startedAt) {
      throw new Error('Attempt to close a thread which hasn\'t been started yet');
    }

    resolve({
      code,
      events: this.events,
      execTime: Date.now() - this.startedAt,
      file: this.file,
      syncedSubprocessData: this.syncedSubprocessData,
    });
  }
}
