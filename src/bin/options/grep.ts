import * as Mocha from 'mocha';

export default function applyGrepPattern(mocha: Mocha, stringPattern?: string) {

  if (stringPattern) {
    mocha.grep(stringPattern);
  }
}
