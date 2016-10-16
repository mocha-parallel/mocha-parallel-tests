'use strict';

const hooks = [
    'afterEach',
    'after',
    'beforeEach',
    'before',
    'describe',
    'it',
    'setup',
    'suiteSetup',
    'suiteTeardown',
    'suite',
    'teardown',
    'test',
    'run'
];

const noop = () => {};

export const patch = () => {
    for (let hook of hooks) {
        global[hook] = noop;
        global[hook].only = noop;
        global[hook].skip = noop;
    }
};

export const restore = () => {
    for (let hook of hooks) {
        delete global[hook];
    }
};
