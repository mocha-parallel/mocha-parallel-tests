import * as Mocha from 'mocha';
import * as yargs from 'yargs';

import { DEBUG_SUBPROCESS, SUITE_OWN_OPTIONS } from '../config';
import {
  applyCompilers,
  applyDelay,
  applyGrepPattern,
  applyNoTimeouts,
  applyRequires,
  applyTimeouts,
} from '../util';
import IPC from './ipc';
import applyExit from './options/exit';
import applyFullTrace from './options/full-trace';
import { getReporterFactory } from './reporter';

const argv = yargs
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
  .number('slow')
  .option('test', {
    demandOption: true,
    string: true,
  })
  .option('require', {
    array: true,
    default: [],
  })
  .number('retries')
  .number('timeout')
  .parse(process.argv);

const debugSubprocess = argv[DEBUG_SUBPROCESS.yargs] as boolean;
const ipc = new IPC();
const Reporter = getReporterFactory(ipc, debugSubprocess);

const mocha = new Mocha();
mocha.addFile(argv.test);

// --compilers
applyCompilers(argv.compilers);

// --delay
applyDelay(mocha, argv.delay);

// --grep
applyGrepPattern(mocha, argv.grep);

// --enableTimeouts
applyNoTimeouts(mocha, argv.enableTimeouts);

// --exit
const onComplete = applyExit(ipc, argv.exit);

// --require
applyRequires(argv.require);

// --timeout
applyTimeouts(mocha, argv.timeout);

// --full-trace
applyFullTrace(mocha, argv['full-trace']);

// apply main process root suite properties
for (const option of SUITE_OWN_OPTIONS) {
  const suiteProp = `_${option}`;
  mocha.suite[suiteProp] = argv[option];
}

mocha.reporter(Reporter).run(onComplete);
