import { Worker } from 'worker_threads';
import { resolve } from 'path';

import { SubprocessMessage, Thread, ThreadOptions } from '../../thread';
import { ISubprocessResult, ISubprocessSyncedData } from '../../interfaces';
import { removeDebugArgs } from '../util';

export interface WorkerData {
  file: string;
  options: ThreadOptions;
}

export class WorkerThread implements Thread {
  private file: string;
  private options: ThreadOptions;
  private events: SubprocessMessage[] = [];
  private startedAt: number | undefined;
  private syncedSubprocessData: ISubprocessSyncedData | undefined;

  constructor(file: string, options: ThreadOptions) {
    this.file = file;
    this.options = options;
  }

  run() {
    const extension = this.options.isTypescriptRunMode ? 'ts' : 'js';
    const workerPath = resolve(__dirname, `../../subprocess/worker.${extension}`);

    this.startedAt = Date.now();

    return new Promise<ISubprocessResult>((resolve) => {
      const worker = new Worker(workerPath, {
        execArgv: process.execArgv.filter(removeDebugArgs),
        stderr: true,
        stdout: true,
        workerData: this.buildWorkerData(),
      });

      worker.stderr.on('data', this.onStderr);
      worker.stdout.on('data', this.onStdout);
      worker.on('message', this.onMessage);

      // worker.on('error', ...);
      worker.on('exit', this.onExit(resolve));
    });
  }

  private buildWorkerData(): WorkerData {
    return {
      file: resolve(this.file),
      options: this.options,
    };
  }

  private onMessage = ({ event, data }) => {
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

  private onExit = (resolve: (data: ISubprocessResult) => void) => (code: number) => {
    // debugLog(`Process for ${file} exited with code ${code}`);

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
