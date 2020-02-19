import Mocha from 'mocha';

import MessageChannel from './message-channel';
import { getReporterFactory } from './reporter';
import { applyCompilers, applyDelay, applyGrepPattern, applyNoTimeouts, applyRequires, applyTimeouts, applyFiles, applyUi } from '../util';
import applyExit from './options/exit';
import applyFullTrace from './options/full-trace';
import { SUITE_OWN_OPTIONS } from '../config';
import { ThreadOptions } from '../thread';

export function runMocha(file: string, options: ThreadOptions, debugSubprocess: boolean) {
  const channel = new MessageChannel();
  const Reporter = getReporterFactory(channel, debugSubprocess);

  const mocha = new Mocha();
  mocha.addFile(file);

  // --compilers
  applyCompilers(options.compilers);

  // --delay
  applyDelay(mocha, options.delay);

  // --grep
  applyGrepPattern(mocha, options.grep);

  // --enableTimeouts
  applyNoTimeouts(mocha, options.enableTimeouts);

  // --exit
  const onComplete = applyExit(channel, options.exitImmediately);

  // --file
  applyFiles(mocha, options.file);

  // --require
  applyRequires(options.requires);

  // --timeout
  applyTimeouts(mocha, options.timeout);

  // --full-trace
  applyFullTrace(mocha, options.fullTrace);

  // --ui
  applyUi(mocha, options.ui);

  // apply main process root suite properties
  for (const option of SUITE_OWN_OPTIONS) {
    const suiteProp = `_${option}`;
    mocha.suite[suiteProp] = options[option];
  }

  mocha.reporter(Reporter).run(onComplete);
}
