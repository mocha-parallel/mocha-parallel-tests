'use strict';

var events = require('events');
var util = require('util');
var debug = require('debug')('mocha-parallel-tests');

var slice = Array.prototype.slice;

function extendTestData(emitData, testData) {
    debug('Test data: %j', testData);
    debug('Emit data: %j', emitData);

    emitData.fullTitle = function () {
        return testData.fullTitle || testData.title;
    };

    return emitData;
}

/**
 * Creates runner instance
 * @constructor
 */
function Runner() {}

// inherit runner objects from EventEmitter
util.inherits(Runner, events.EventEmitter);

/**
 * Emit events
 *
 * @param {String} evt - event title
 * @param {Object} test - test data
 */
Runner.prototype.emit = function Runner_emit(evt, test) {
    var args;
    var baseEmit = events.EventEmitter.prototype.emit;
    var emitArgs;

    if (evt === 'fail') {
        args = slice.call(arguments, 1);
    } else {
        args = slice.call(arguments, 2);
    }

    // extend test data
    if (args.length) {
        args[0].fullTitle = (test.fullTitle || test.title);
        emitArgs = [evt].concat(args);
    } else {
        emitArgs = slice.call(arguments, 0);
    }

    // emit data
    baseEmit.apply(this, emitArgs);
    return this;
}

Runner.prototype.start = function Runner_start(test) {
    this.emit('start', test);
};

Runner.prototype.pending = function Runner_start(test) {
    this.emit('pending', test);
};

Runner.prototype.suite = function Runner_pass(suite) {
    this.emit('suite', suite);
};

Runner.prototype.suiteEnd = function Runner_suiteEnd(suite) {
    this.emit('suite end', suite);
};

Runner.prototype.test = function Runner_test(test) {
    this.emit('test', test);
};

Runner.prototype.testEnd = function Runner_testEnd(test) {
    this.emit('test end', test);
};

Runner.prototype.pending = function Runner_pending(test) {
    this.emit('pending', test);
};

Runner.prototype.pass = function Runner_pass(test) {
    this.emit('pass', test);
};

Runner.prototype.fail = function Runner_fail(test) {
    this.emit('fail', test[0], test[1]);
};

Runner.prototype.end = function Runner_end(test) {
    this.emit('end', test);
};


module.exports = Runner;
