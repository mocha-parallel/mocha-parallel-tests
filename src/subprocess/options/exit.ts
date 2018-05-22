// tslint:disable:no-console
function exitLater(code) {
  process.on('exit', function onExit() {
    process.exit(Math.min(code, 255));
  });
}

function exit(code) {
  const clampedCode = Math.min(code, 255);

  // that's what mocha does
  console.log('');
  console.error('');

  process.exit(clampedCode);
}

export default function applyExit(shouldExitImmediately: any) {
  return shouldExitImmediately ? exit : exitLater;
}
