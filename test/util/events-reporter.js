const Base = require('mocha').reporters.Base;

module.exports = class Reporter extends Base {
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
};
