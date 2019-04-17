import * as Mocha from 'mocha';

export default function applyForbidOnly(mocha: Mocha, forbidOnly?: boolean) {
  if (forbidOnly) {
    mocha.forbidOnly();
  }
}
