import { SubprocessResult, SubprocessOutputMessage, SubprocessRunnerMessage } from './message-channel';

export type ListenerMessage = (message: Buffer) => void;
export type ListenerStandardStream = (message: Buffer) => void;
export type ExitCode = number;

export interface ThreadOptions {
  bail?: boolean;
  compilers: string[];
  delay: boolean;
  enableTimeouts?: boolean;
  exitImmediately: boolean;
  fullTrace: boolean;
  grep?: string;
  isTypescriptRunMode: boolean;
  file: string[];
  requires: string[];
  retries?: number;
  slow?: boolean;
  timeout?: number;
  ui?: string;
}

export interface Thread {
  run(): Promise<SubprocessResult>;
}

export type SubprocessMessage = SubprocessOutputMessage | SubprocessRunnerMessage;

export function supportsWorkerThreads(): boolean {
  if (process.env.USE_CHILD_PROCESS === '1') {
    return false;
  }
  try {
    require('worker_threads');
    return true;
  } catch (ex) {
    return false;
  }
}
