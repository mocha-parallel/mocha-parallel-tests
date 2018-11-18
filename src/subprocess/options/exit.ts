import IPC from '../ipc';

// tslint:disable:no-console
function exitLater(code) {
  process.on('exit', function onExit() {
    process.exit(Math.min(code, 255));
  });
}

const exit = (ipc: IPC) => (code: number) => {
  const clampedCode = Math.min(code, 255);

  // that's what mocha does
  console.log('');
  console.error('');

  // wait until all IPC messages are sent to the main process
  ipc.runOnExhausted(() => {
    process.exit(clampedCode);
  });
};

export default function applyExit(ipc: IPC, shouldExitImmediately: any) {
  return shouldExitImmediately ? exit(ipc) : exitLater;
}
