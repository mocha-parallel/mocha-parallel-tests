import { fork } from 'child_process';
import * as os from 'os';
import { resolve as pathResolve } from 'path';
import { removeDebugArgs } from './util';

interface IMochaProcess {
  send: (msg: any) => void;
  kill: () => void;
  destroy: () => void;
}

export default class ProcessPool {
  private maxParallel: number;
  private waitingList: Array<(proc: IMochaProcess) => void> = [];
  private unusedProcesses: IMochaProcess[] = [];
  private processes: IMochaProcess[] = [];

  constructor() {
    this.maxParallel = os.cpus().length;
  }

  setMaxParallel(n) {
    this.maxParallel = n;
  }

  async getOrCreate(isTypescriptRunMode): Promise<IMochaProcess> {
    const extension = isTypescriptRunMode ? 'ts' : 'js';
    const runnerPath = pathResolve(__dirname, `../subprocess/runner.${extension}`);

    const lastUnusedProcess = this.unusedProcesses.pop();
    if (lastUnusedProcess) {
      return lastUnusedProcess;
    }

    if (this.processes.length >= this.maxParallel) {
      const process: IMochaProcess = await new Promise<IMochaProcess>((resolve) => {
        this.waitingList.push(resolve);
      });
      return process;
    }
    return this.create(runnerPath, {
      // otherwise `--inspect-brk` and other params will be passed to subprocess
      execArgv: process.execArgv.filter(removeDebugArgs),
      stdio: ['ipc'],
    });
  }

  create(runnerPath: string, opt: object): IMochaProcess {
    const process = fork(runnerPath, [], opt);

    const handle = {
      destroy: () => {
        const nextOnWaitingList = this.waitingList.pop();
        if (nextOnWaitingList) {
          nextOnWaitingList(handle);
        } else {
          this.unusedProcesses.push(handle);
        }
      },
      kill: () => {
        process.kill();
      },
      send: (msg: any) => {
        process.send(msg);
      },
    };

    this.processes.push(handle);

    return handle;
  }

  destroyAll() {
    this.processes.forEach((proc) => {
      proc.kill();
    });
  }
}
