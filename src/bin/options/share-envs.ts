import { SHARE_ENV } from 'worker_threads';
import Mocha from '../../main/mocha';

export default function applyShareEnvs(mocha: Mocha, shareEnvs?: boolean) {
  if (shareEnvs) {
    mocha.setEnvs(shareEnvs? SHARE_ENV: null);
  }
}
