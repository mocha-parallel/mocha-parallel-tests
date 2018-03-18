import * as assert from 'assert';
import * as Mocha from 'mocha';
import { join } from 'path';
import { ICLIReporterOptions } from '../../interfaces';

export default function applyReporter(mocha: Mocha, reporter: any, reporterOptions: ICLIReporterOptions) {
  assert.strictEqual(typeof reporter, 'string', '--reporter option can be specified only once');
  mocha.reporter(reporter, reporterOptions);

  // load reporter
  let Reporter: any;

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
