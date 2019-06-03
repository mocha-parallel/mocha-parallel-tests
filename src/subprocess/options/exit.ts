import MessageChannel from '../message-channel';

// tslint:disable:no-console
function exitLater(code) {
  process.on('exit', function onExit() {
    process.exit(Math.min(code, 255));
  });
}

const exit = (channel: MessageChannel) => (code: number) => {
  const clampedCode = Math.min(code, 255);

  // that's what mocha does
  console.log('');
  console.error('');

  // wait until all RUNNABLE_MESSAGE_CHANNEL_PROP messages are sent to the main process
  channel.runOnExhausted(() => {
    process.exit(clampedCode);
  });
};

export default function applyExit(channel: MessageChannel, shouldExitImmediately: any) {
  return shouldExitImmediately ? exit(channel) : exitLater;
}
