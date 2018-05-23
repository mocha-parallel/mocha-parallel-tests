import Mocha from '../../main/mocha';

export default function applyExit(mocha: Mocha, exitMode: boolean) {
  if (exitMode) {
    mocha.enableExitMode();
  }
}
