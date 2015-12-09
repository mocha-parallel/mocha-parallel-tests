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


Queue.prototype.start = function Queue_start(evt) {
    inProcess = true;
}

Queue.prototype.end = function Queue_end(evt) {
    inProcess = false;
    this.emit('free');
}

Queue.prototype.inProcess = function Queue_inProcess() {
    return inProcess;
}


module.exports = Queue;
