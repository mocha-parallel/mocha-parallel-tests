export const RUNNABLE_IPC_PROP = '__mpt_randomId__';
export const SUBPROCESS_RETRIED_SUITE_ID = '__mpt_suiteId_';

export const SUITE_OWN_OPTIONS = [
  'timeout',
  'enableTimeouts',
  'slow',
  'bail',
  'retries',
];

export const DEBUG_SUBPROCESS = {
  argument: '--debug-mpt-subprocess',
  yargs: 'debugMptSubprocess',
};
