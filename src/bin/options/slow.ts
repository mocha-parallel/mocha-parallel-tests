import * as Mocha from 'mocha';

export default function applySlow(mocha: Mocha, slow: number) {
  if (slow) {
    (mocha.suite as any).slow(slow);
  }
}
