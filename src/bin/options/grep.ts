import * as Mocha from 'mocha';

export default function applyGrepPattern(mocha: Mocha, stringPattern: string) {
  if (null !== stringPattern) {
    mocha.grep(stringPattern);
  }
}
