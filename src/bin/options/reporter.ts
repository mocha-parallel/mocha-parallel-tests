import assert from 'assert';
import Mocha, { reporters } from 'mocha';
import { join } from 'path';
import { CLIReporterOptions } from './reporter-options';

export default function applyReporter(mocha: Mocha, reporter: string, reporterOptions: CLIReporterOptions) {
  assert.strictEqual(typeof reporter, 'string', '--reporter option can be specified only once');
  mocha.reporter(reporter, reporterOptions);

  // load reporter
  let Reporter: reporters.Base;

  // required reporter can be in the process CWD
  const cwd = process.cwd();
  module.paths.push(cwd, join(cwd, 'node_modules'));

  try {
    Reporter = require(`mocha/lib/reporters/${reporter}`);
  } catch (ex) {
    try {
      Reporter = require(reporter);
    } catch (ex) {
      throw new Error(`Reporter "${reporter}" does not exist`);
    }
  }

  return Reporter;
}
