'use strict';

import assert from 'assert';
import Mocha from 'mocha';
import RunnerWrapped from './utils/runner-wrapped';

let runnerInstance;

export const createInstance = () => {
    assert(!runnerInstance, 'Runner instance has already been created. Use getInstance() instead');

    const mocha = new Mocha;
    runnerInstance = new RunnerWrapped(mocha.suite, 0);

    return runnerInstance;
};

export const getInstance = () => {
    assert(runnerInstance, 'No runner instance is available. Run createInstance() first');
    return runnerInstance;
};
