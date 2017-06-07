'use strict';

import debug from 'debug';
import MochaRunner from 'mocha/lib/runner';

const debugLog = debug('mocha-parallel-tests:runner-wrapped');

export default class RunnerWrapped extends MochaRunner {
    constructor(suite, delay) {
        super(suite, delay);

        // this is default mocha runner behaviour
        // when runner is created in mocha.run()
        this.ignoreLeaks = true;

        this._started = false;
    }

    start(test) {
        if (this._started) {
            return;
        }

        this._started = true;
        this.emit('start', test);
    }

    end(failsOccured, reporter) {
        this.emit('end', {failsOccured, reporter});
    }

    /**
     * Emit events
     *
     * @param {String} evt - event title
     * @param {Object} test - test data
     */
    emit(...args) {
        debugLog(`Emit ${args[0]} event`);

        // emit data
        super.emit.apply(this, args);
        return this;
    }
}
