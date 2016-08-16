'use strict';

import Mocha from 'mocha';

import Reporter from './lib/reporter';
import {
    addTest,
    runTests,
    // setOptions as setWatcherOptions
} from './lib/watcher';

class MochaParallelTests extends Mocha {
    constructor() {
        super();

        this._filesTotal = 0;
        this._throttledCalls = [];
    }

    addFile(file) {
        addTest(file);
        this._filesTotal++;

        return this;
    }

    run(callback) {
        return runTests({
            options: Object.assign({}, {
                reporter: Reporter,
                testsLength: this._filesTotal
            }),
            callback,
            throttledCalls: this._throttledCalls
        });
    }
}

Object.keys(Mocha.prototype).forEach(key => {
    if (typeof Mocha.prototype[key] !== 'function') {
        return;
    }

    if (key === 'run' || key === 'addFile') {
        return;
    }

    MochaParallelTests.prototype[key] = function (...args) {
        // mocha calls some of its methods inside constructor
        // so it's unsafe to push smth to _throttledCalls immediately
        process.nextTick(() => {
            this._throttledCalls.push({key, args});
        });

        return this;
    };
});

export default MochaParallelTests;
