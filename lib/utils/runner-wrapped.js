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
        this.emit('start');
    }

    /**
     * Emit events
     *
     * @param {String} evt - event title
     */
    emit(...args) {
        debugLog(`Emit ${args[0]} event`);

        // emit data
        super.emit.apply(this, args);
        return this;
    }
}
