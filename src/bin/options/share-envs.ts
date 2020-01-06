import worker_threads from 'worker_threads';
import Mocha from '../../main/mocha';

export default function applyShareEnvs(mocha: Mocha, shareEnvs?: boolean) {
  if (shareEnvs) {
    mocha.setEnvs(shareEnvs? worker_threads.SHARE_ENV: null);
  }
}
