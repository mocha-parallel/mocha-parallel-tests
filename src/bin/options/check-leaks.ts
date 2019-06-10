import Mocha from 'mocha';

export default function applyCheckLeaks(mocha: Mocha, checkLeaks?: boolean) {
  if (checkLeaks) {
    mocha.checkLeaks();
  }
}
