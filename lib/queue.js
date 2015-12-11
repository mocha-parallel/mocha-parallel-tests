'use strict';

var events = require('events');
var util = require('util');

var inProcess = false;

/**
 * Creates queue instance
 * @constructor
 */
function Queue() {}

// inherit queue objects from EventEmitter
util.inherits(Queue, events.EventEmitter);

// start queue process
Queue.prototype.start = function Queue_start(evt) {
    inProcess = true;
}
// end queue process
Queue.prototype.end = function Queue_end(evt) {
    inProcess = false;
    this.emit('free');
}
// get queue process state
Queue.prototype.inProcess = function Queue_inProcess() {
    return inProcess;
}

module.exports = new Queue();
