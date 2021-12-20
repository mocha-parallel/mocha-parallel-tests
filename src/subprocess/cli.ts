import yargs from 'yargs';

import { DEBUG_SUBPROCESS } from '../config';
import { runMocha } from './runner';
import { ThreadOptions } from '../thread';

interface Args {
  bail?: boolean;
  compilers: string[];
  delay?: boolean;
  grep?: string;
  enableTimeouts?: boolean;
  exit?: boolean;
  ['full-trace']?: boolean;
  require: string[];
  retries?: number;
  slow?: boolean;
  timeout?: number;
  test: string;
  file: string[];
  ui?: string;
}

function isDebugSubprocesss(argv: Args) {
  return argv[DEBUG_SUBPROCESS.yargs] as boolean;
}

function threadOptionsFromArgv(argv: Args): ThreadOptions {
  return {
    bail: argv.bail,
    compilers: argv.compilers,
    delay: argv.delay || false,
    enableTimeouts: argv.enableTimeouts,
    exitImmediately: argv.exit || false,
    fullTrace: argv['full-trace'] || false,
    grep: argv.grep,
    isTypescriptRunMode: isDebugSubprocesss(argv),
    requires: argv.require,
    retries: argv.retries,
    slow: argv.slow,
    timeout: argv.timeout,
    file: argv.file,
    ui: argv.ui
  };
}

const argv: Args = yargs
  .boolean('bail')
  .option('compilers', {
    array: true,
    default: [],
  })
  .boolean('delay')
  .string('grep')
  .boolean('enableTimeouts')
  .option('exit', {
    boolean: true,
  })
  .option('full-trace', {
    boolean: true,
  })
  .boolean('slow')
  .option('test', {
    demandOption: true,
    string: true,
  })
  .option('require', {
    array: true,
    default: [],
  })
  .option('file', {
    array: true,
    default: []
  })
  .number('retries')
  .number('timeout')
  .option('ui', {
    string: true,
  })
  .parse(process.argv);

const debugSubprocess = isDebugSubprocesss(argv);
const options = threadOptionsFromArgv(argv);

runMocha(argv.test, options, debugSubprocess);
