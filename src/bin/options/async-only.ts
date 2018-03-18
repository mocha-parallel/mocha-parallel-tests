import * as Mocha from 'mocha';

export default function applyAsyncOnly(mocha: Mocha, asyncOnly: boolean) {
  if (asyncOnly) {
    (mocha as any).asyncOnly();
  }
}
