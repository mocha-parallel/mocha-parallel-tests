import * as Mocha from 'mocha';

export default function applyMaxParallel(mocha: Mocha, maxParallel?: number) {
  if (maxParallel !== undefined) {
    (mocha as any).setMaxParallel(maxParallel);
  }
}
