import * as Mocha from 'mocha';

export default function applyFullTrace(mocha: Mocha, fullTrace: boolean) {
  if (fullTrace) {
    (mocha as any).fullTrace();
  }
}
