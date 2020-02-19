import { existsSync } from 'fs';
import { join, resolve } from 'path';
import Mocha from "mocha";

export interface CLICompilers {
  compilers: string[];
  extensions: string[];
}

export function setProcessExitListeners() {
  process.on('unhandledRejection', (reason) => {
    const message = reason && 'stack' in reason
      ? (reason as Error).stack
      : 'Unhandled asynchronous exception';

    // eslint-disable-next-line no-console
    console.error(`Unhandled asynchronous exception: ${message}`);
    process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    // eslint-disable-next-line no-console
    console.error(`Uncaught exception: ${err.stack}`);
    process.exit(1);
  });
}

export function applyFiles(mocha: Mocha, files: string | string[]) {
  const fileList: string[] = Array.isArray(files) ? files : [files];

  if(fileList) {
    mocha.files = fileList.concat(mocha.files);
  }
}

export function applyRequires(requires: string | string[]): string[] {
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

export function applyCompilers(compilers: string | string[]): CLICompilers {
  const compilersList: string[] = Array.isArray(compilers) ? compilers : [compilers];
  const output: CLICompilers = {
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

export function applyDelay(mocha: Mocha, delay?: boolean) {
  if (delay) {
    mocha.delay();
  }
}

export function applyGrepPattern(mocha: Mocha, stringPattern?: string) {
  if (stringPattern) {
    mocha.grep(stringPattern);
  }
}

export function applyNoTimeouts(mocha: Mocha, allowTimeouts?: boolean) {
  if (allowTimeouts === false) {
    mocha.enableTimeouts(false);
  }
}

export function applyTimeouts(mocha: Mocha, timeout?: number) {
  if (timeout !== undefined) {
    mocha.suite.timeout(timeout);
  }
}

export function applyUi(mocha: Mocha, ui?: string) {
  if(ui) {
    mocha.ui(ui);
  }
}
