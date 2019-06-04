// eslint-disable-next-line @typescript-eslint/no-var-requires
const { register: registerTypescriptHandler } = require('ts-node');

registerTypescriptHandler();
require(`${__dirname}/worker.ts`);
