import Mocha from 'mocha';

export default function applyRetries(mocha: Mocha, retries?: number) {
  if (retries) {
    mocha.suite.retries(retries);
  }
}
