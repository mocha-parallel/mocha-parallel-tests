#!/usr/bin/env node

const Base = require('mocha').reporters.Base;
const Mocha = require('mocha');

class Reporter extends Base {
    constructor(runner) {
        super(runner);

        [
            'waiting',
            'start',
            'end',
            'suite',
            'suite end',
            'test',
            'test end',
            'pass',
            'fail',
            'pending',
            'hook',
            'hook end',
        ].forEach((evtName) => {
            runner.on(evtName, this.onRunnerEventFired.bind(this, evtName));
        });
    }

    onRunnerEventFired(evtName) {
        console.log(evtName);
    }
}

const mocha = new Mocha;
mocha.reporter(Reporter);
mocha.addFile(`${__dirname}/one-crash-one-ok/ok.spec.js`);
mocha.addFile(`${__dirname}/one-crash-one-ok/crash.spec.js`);


// first listener actually checks that all events have been emitted
// second is a spy which checks that "end" event has been emitted
mocha.run();
