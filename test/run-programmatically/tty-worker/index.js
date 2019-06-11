#!/usr/bin/env node

'use strict';

const MochaParallelTests = require('../../../dist/main/mocha').default;
const mocha = new MochaParallelTests();

mocha
    .reporter('spec')
    .addFile(`${__dirname}/../_spec/dummy.js`)
    .run();

process.on('unhandledRejection', (reason) => {
    console.log(`Unhandled promise rejection: ${reason.stack}`);
    process.exit(1);
});
