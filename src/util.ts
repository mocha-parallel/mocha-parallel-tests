import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { ICLICompilers } from './interfaces';

export function setProcessExitListeners() {
  process.on('unhandledRejection', (reason) => {
    // tslint:disable-next-line:no-console
    console.error(`Unhandled asynchronous exception: ${reason.stack}`);
    process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    // tslint:disable-next-line:no-console
    console.error(`Uncaught exception: ${err.stack}`);
    process.exit(1);
  });
}

export function applyRequires(requires: any): string[] {
  const requiresList: string[] = Array.isArray(requires) ? requires : [requires];
  const output: string[] = [];

  // required file can be in the process CWD
  const cwd = process.cwd();
  module.paths.push(cwd, join(cwd, 'node_modules'));

  for (const mod of requiresList) {
    const abs = existsSync(mod) || existsSync(`${mod}.js`);
    const requirePath = abs ? resolve(mod) : mod;

    require(requirePath);
    output.push(requirePath);
  }

  return output;
}

export function applyCompilers(compilers: any): ICLICompilers {
  const compilersList: string[] = Array.isArray(compilers) ? compilers : [compilers];
  const output: ICLICompilers = {
    compilers: compilersList,
    extensions: ['js'],
  };

  // required compiler can be in the process CWD
  const cwd = process.cwd();
  module.paths.push(cwd, join(cwd, 'node_modules'));

  for (const compiler of compilersList) {
    const idx = compiler.indexOf(':');
    const ext = compiler.slice(0, idx);
    let mod = compiler.slice(idx + 1);

    if (mod.startsWith('.')) {
      mod = join(process.cwd(), mod);
    }

    require(mod);
    output.extensions.push(ext);
  }

  return output;
}

export function applyDelay(mocha: Mocha, delay: boolean) {
  if (delay) {
    mocha.delay();
  }
}

export function applyGrepPattern(mocha: Mocha, stringPattern?: string) {
  if (stringPattern) {
    mocha.grep(stringPattern);
  }
}

export function applyNoTimeouts(mocha: Mocha, allowTimeouts: boolean) {
  if (allowTimeouts === false) {
    mocha.enableTimeouts(false);
  }
}

export function applyTimeouts(mocha: Mocha, timeout: number) {
  if (timeout) {
    mocha.suite.timeout(timeout);
  }
}
