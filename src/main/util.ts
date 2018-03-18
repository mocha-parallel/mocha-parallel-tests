// @ts-ignore
import { Hook, Suite, Test } from 'mocha';

const DEBUG_CLI_ARGS = ['--inspect', '--debug', '--debug-brk', '--inspect-brk'];
const noop = () => null;

export function removeDebugArgs(arg: string): boolean {
  return !DEBUG_CLI_ARGS.includes(arg);
}

export function subprocessParseReviver(_: string, value: any): any {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  if (value.type === 'test') {
    const test = new Test(value.title, noop);
    return Object.assign(test, value);
  }

  if (value.type === 'hook') {
    const hook = new Hook(value.title, noop);
    return Object.assign(hook, value);
  }

  if (Array.isArray(value.suites)) {
    const suite = new Suite(value.title, {});
    return Object.assign(suite, value);
  }

  return value;
}
