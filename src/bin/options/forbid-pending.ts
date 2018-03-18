import * as Mocha from 'mocha';

export default function applyForbidPending(mocha: Mocha, forbidPending: boolean) {
  if (forbidPending) {
    mocha.forbidPending();
  }
}
