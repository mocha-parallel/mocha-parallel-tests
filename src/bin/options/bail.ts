import Mocha from 'mocha';

export default function applyBail(mocha: Mocha, bail?: boolean) {
  mocha.suite.bail(bail || false);
}
