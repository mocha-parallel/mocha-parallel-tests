'use strict';

import debug from 'debug';

const hooks = [
    'afterEach',
    'after',
    'beforeEach',
    'before',
    'describe',
    'context',
    'it',
    'setup',
    'specify',
    'suiteSetup',
    'suiteTeardown',
    'suite',
    'teardown',
    'test',
    'run',
    'xcontext',
    'xdescribe',
    'xit',
    'xspecify'
];

const debugLog = debug('mocha-parallel-tests:hooks');
const noop = () => {};

export const patch = () => {
    debugLog('Patch global hooks');

    for (let hook of hooks) {
        global[hook] = noop;
        global[hook].only = noop;
        global[hook].skip = noop;
    }
};

export const restore = () => {
    debugLog('Restore global hooks');

    for (let hook of hooks) {
        delete global[hook];
    }
};
