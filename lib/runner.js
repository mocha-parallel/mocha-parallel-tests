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
Runner.prototype.emit = function Runner_emit(evt, test, err) {
    var args = slice.call(arguments, 2);
    var baseEmit = events.EventEmitter.prototype.emit;
    var emitArgs;

    // extend test data
    if (args.length) {
        extendTestData(args[0], test);
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

Runner.prototype.pass = function Runner_pass(test) {
    this.emit('pass', test);
};

Runner.prototype.fail = function Runner_fail(test) {
    this.emit('fail', test);
};

Runner.prototype.end = function Runner_end(test) {
    this.emit('end', test);
};

Runner.prototype.testEnd = function Runner_testEnd(test) {
    this.emit('test end', test);
};


module.exports = Runner;
