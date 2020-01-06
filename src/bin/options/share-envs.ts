import Mocha from '../../main/mocha';

export default function applyShareEnvs(mocha: Mocha, shareEnvs?: boolean) {
  if (shareEnvs) {
    mocha.setEnvs(require('worker_threads').SHARE_ENV);
  }
}
