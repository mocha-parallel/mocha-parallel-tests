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

export const patch = () => {
    for (let hook of hooks) {
        global[hook] = () => {};
    }
};

export const restore = () => {
    for (let hook of hooks) {
        delete global[hook];
    }
};
