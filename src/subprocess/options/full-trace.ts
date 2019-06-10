import Mocha from 'mocha';

export default function applyFullTrace(mocha: Mocha, fullTrace?: boolean) {
  if (fullTrace) {
    mocha.options.fullStackTrace = true;
  }
}
