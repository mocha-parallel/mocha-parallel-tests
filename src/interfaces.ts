export interface SubprocessRunnerMessage {
  data: any;
  event: string;
  type: 'runner';
}

export interface SubprocessOutputMessage {
  event: undefined;
  data: Buffer;
  type: 'stdout' | 'stderr';
}

export interface SubprocessSyncedData {
  results: string;
  retries: string;
}

export interface SubprocessResult {
  code: number;
  file: string;
  events: (SubprocessRunnerMessage | SubprocessOutputMessage)[];
  execTime: number;
  syncedSubprocessData?: SubprocessSyncedData;
}
