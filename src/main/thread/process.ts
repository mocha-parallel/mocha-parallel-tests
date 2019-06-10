import { fork } from 'child_process';
import { Debugger } from 'debug';
import { resolve } from 'path';

import { SubprocessMessage, Thread, ThreadOptions } from '../../thread';
import { SubprocessResult, SubprocessSyncedData } from '../../message-channel';
import { removeDebugArgs } from '../util';
import { SUITE_OWN_OPTIONS } from '../../config';

export class ProcessThread implements Thread {
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
    const extension = this.options.isTypescriptRunMode ? 'ts' : 'js';
    const runnerPath = resolve(__dirname, `../../subprocess/cli.${extension}`);

    this.startedAt = Date.now();

    return new Promise<SubprocessResult>((resolve, reject) => {
      const test = fork(runnerPath, this.buildForkArgs(), {
        // otherwise `--inspect-brk` and other params will be passed to subprocess
        execArgv: process.execArgv.filter(removeDebugArgs),
        stdio: ['ipc'],
      });

      if (!test.stdout || !test.stderr) {
        reject(new Error('Could not find standard streams for forked process'));
        return;
      }

      test.on('message', this.onMessage);
      test.stdout.on('data', this.onStdout);
      test.stderr.on('data', this.onStderr);
      test.on('close', this.onClose(resolve));
    });
  }

  private buildForkArgs(): string[] {
    const forkArgs: string[] = ['--test', resolve(this.file)];

    for (const option of SUITE_OWN_OPTIONS) {
      // bail is undefined by default, we need to somehow pass its value to the subprocess
      const propValue = this.options[option];
      forkArgs.push(`--${option}`, propValue === undefined ? false : propValue);
    }

    for (const requirePath of this.options.requires) {
      forkArgs.push('--require', requirePath);
    }

    for (const compilerPath of this.options.compilers) {
      forkArgs.push('--compilers', compilerPath);
    }

    if (this.options.delay) {
      forkArgs.push('--delay');
    }

    if (this.options.grep) {
      forkArgs.push('--grep', this.options.grep);
    }

    if (this.options.exitImmediately) {
      forkArgs.push('--exit');
    }

    if (this.options.fullTrace) {
      forkArgs.push('--full-trace');
    }

    return forkArgs;
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

  private onClose = (resolve: (data: SubprocessResult) => void) => (code: number) => {
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
