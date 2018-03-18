import Mocha from '../../main/mocha';

export default function applyMaxParallel(mocha: Mocha, maxParallel?: number) {
  if (maxParallel !== undefined) {
    mocha.setMaxParallel(maxParallel);
  }
}
