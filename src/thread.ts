import { ISubprocessResult } from './interfaces';

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
  requires: string[];
  retries?: number;
  slow?: boolean;
  timeout?: number;
}

export interface Thread {
  run(): Promise<ISubprocessResult>;
}
