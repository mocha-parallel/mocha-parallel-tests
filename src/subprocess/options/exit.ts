import MessageChannel from '../message-channel';

function exitLater(code) {
  process.on('exit', function onExit() {
    process.exit(Math.min(code, 255));
  });
}

const exit = (channel: MessageChannel) => (code: number) => {
  const clampedCode = Math.min(code, 255);

  // that's what mocha does
  console.log(''); // eslint-disable-line no-console
  console.error(''); // eslint-disable-line no-console

  // wait until all RUNNABLE_MESSAGE_CHANNEL_PROP messages are sent to the main process
  channel.runOnExhausted(() => {
    process.exit(clampedCode);
  });
};

export default function applyExit(channel: MessageChannel, shouldExitImmediately: boolean) {
  return shouldExitImmediately ? exit(channel) : exitLater;
}
