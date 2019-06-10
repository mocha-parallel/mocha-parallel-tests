export interface SubprocessRunnerMessage {
  data: any;
  event: string;
  type: 'runner';
}

export interface SubprocessOutputMessage {
  data: Buffer;
  type: 'stdout' | 'stderr';
}

export interface SubprocessSyncedData {
  results: string;
  retries: string;
}

export type SubprocessMessage = SubprocessRunnerMessage | SubprocessOutputMessage;

export interface SubprocessResult {
  code: number;
  file: string;
  events: SubprocessMessage[];
  execTime: number;
  syncedSubprocessData?: SubprocessSyncedData;
}
