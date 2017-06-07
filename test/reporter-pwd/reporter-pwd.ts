'use strict';

var Base = require('mocha').reporters.Base;

/**
 * Initialize a new `Teamcity` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function FileReporter(runner) {
    Base.call(this, runner);

    runner.on('start', function () {
        process.stdout.write('start');
    });

    runner.on('end', function () {
        process.stdout.write('finish');
    });
}

exports = module.exports = FileReporter;
