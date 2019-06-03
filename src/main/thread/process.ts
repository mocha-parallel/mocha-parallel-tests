import { fork } from 'child_process';
import { resolve } from 'path';

import { Thread, ThreadOptions } from '../../thread';
import { ISubprocessResult, ISubprocessOutputMessage, ISubprocessRunnerMessage, ISubprocessSyncedData } from '../../interfaces';
import { removeDebugArgs } from '../util';
import { SUITE_OWN_OPTIONS } from '../../config';

type SubprocessMessage = ISubprocessOutputMessage | ISubprocessRunnerMessage;

export class ProcessThread implements Thread {
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
    const runnerPath = resolve(__dirname, `../../subprocess/cli.${extension}`);

    this.startedAt = Date.now();

    return new Promise<ISubprocessResult>((resolve, reject) => {
      const test = fork(runnerPath, this.buildForkArgs(), {
        // otherwise `--inspect-brk` and other params will be passed to subprocess
        execArgv: process.execArgv.filter(removeDebugArgs),
        stdio: ['ipc'],
      });

      if (!test.stdout || !test.stderr) {
        reject(new Error('COuld not find standard streams for forked process'));
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

  private onClose = (resolve: (data: ISubprocessResult) => void) => (code: number) => {
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
