// import { register as registerTypescriptHandler } from 'ts-node';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { register: registerTypescriptHandler } = require('ts-node');

// monkeypatch Node.JS native TTY function
// otherwise mocha native base reporter throws exception
// inside a worker environment
require('tty').getWindowSize = () => 75;

registerTypescriptHandler();
require(`${__dirname}/worker.ts`);
