import Mocha from '../../main/mocha';
import { getNodeMajorVersion } from "../../util";

export default function applyShareEnvs(mocha: Mocha, shareEnvs?: boolean) {
  if (shareEnvs) {
    if (getNodeMajorVersion() < 12) {
      throw new Error("The share-envs option is available only on node 12 and up.");
    }
    mocha.setEnvs(require('worker_threads').SHARE_ENV);
  }
}
