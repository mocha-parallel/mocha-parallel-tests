import Mocha from '../../main/mocha';

export default function applyShareEnvs(mocha: Mocha, shareEnvs?: boolean) {
  if (shareEnvs !== undefined) {
    mocha.setShareEnvs(shareEnvs);
  }
}
