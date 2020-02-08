import {
  Context,
  Hook,
  Suite,
  Test,
} from 'mocha';

const DEBUG_CLI_ARGS = ['--inspect', '--debug', '--debug-brk', '--inspect-brk'];
const noop = () => null;

export function removeDebugArgs(arg: string): boolean {
  return !DEBUG_CLI_ARGS.includes(arg);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function subprocessParseReviver(_: string, value: any): any {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  if (value.type === 'test') {
    const test = new Test(value.title, noop);

    // mimic test.fn as much as we can
    Object.assign(test, value);
    if (test.fn) {
      test.fn.toString = () => value.body;
    }

    return test;
  }

  if (value.type === 'hook') {
    const hook = new Hook(value.title, noop);
    return Object.assign(hook, value);
  }

  if (Array.isArray(value.suites)) {
    const ctx = new Context();
    const suite = new Suite(value.title, ctx);

    return Object.assign(suite, value);
  }

  return value;
}
