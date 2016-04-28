/**
 * Mocha-parallel-tests wrapper runner.
 * Emits events for final output, i.e. it doesn't emit start/end event for every test file
 */
'use strict';

import EventEmitter from 'events';
import util from 'util';
import debug from 'debug';

const debugLog = debug('mocha-parallel-tests');
const slice = Array.prototype.slice;

const extendTestData = (emitData, testData) => {
    debugLog('Test data: %j', testData);
    debugLog('Emit data: %j', emitData);

    emitData.fullTitle = () => {
        return testData.fullTitle || testData.title;
    }

    return emitData;
}

class Runner extends EventEmitter {
    constructor() {
        super();
        this._started = false;
    }

    /**
     * Emit events
     *
     * @param {String} evt - event title
     * @param {Object} test - test data
     */
    emit(evt, test) {
        let emitArgs;

        const args = (evt === 'fail')
            ? slice.call(arguments, 1)
            : slice.call(arguments, 2);

        // extend test data
        if (args.length) {
            args[0].fullTitle = (test.fullTitle || test.title);
            emitArgs = [evt].concat(args);
        } else {
            emitArgs = slice.call(arguments, 0);
        }

        // emit data
        super.emit.apply(this, emitArgs);
        return this;
    }

    start(test) {
        if (this._started) {
            return;
        }

        this._started = true;
        this.emit('start', test);
    }

    pending(test) {
        this.emit('pending', test);
    }

    suite(suite) {
        this.emit('suite', suite);
    }

    suiteEnd(suite) {
        this.emit('suite end', suite);
    }

    test(test) {
        this.emit('test', test);
    }

    testEnd(test) {
        this.emit('test end', test);
    }

    pending(test) {
        this.emit('pending', test);
    }

    pass(test) {
        this.emit('pass', test);
    }

    fail(test) {
        this.emit('fail', test[0], test[1]);
    }

    end(test) {
        this.emit('end', test);
    }
}

export default Runner;
