#!/usr/bin/env node

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var libExecutable = path.resolve(__dirname, '../../bin/mocha-parallel-tests');
var start = Date.now();

exec(libExecutable + ' -R json --timeout 60000 --slow 30000 test/parallel-order/tests', {
    cwd: path.resolve(__dirname, '../../')
}, function (err, stderr) {
    var diffTime = Date.now() - start;
    assert.equal(Math.round(diffTime / 1000) < 11, true, 'Tests should run in parallel');

    if (err) {
        console.error(err);
        process.exit(1);
    }

    var jsonReporterOutput = stderr.toString();

    try {
        jsonReporterOutput = JSON.parse(jsonReporterOutput);
    } catch (ex) {
        console.error('Native JSON reporter output is not valid JSON: ' + jsonReporterOutput);
        process.exit(1);
    }

    assert.equal(typeof jsonReporterOutput.stats, 'object', 'Reporter should contain stats object');
    assert.equal(jsonReporterOutput.stats.suites, 3, 'Reporter should contain information about 3 suites');
    assert.equal(jsonReporterOutput.stats.tests, 4, 'Reporter should contain information about all run tests');
    assert.equal(jsonReporterOutput.stats.passes, 3, 'Reporter should contain information about all passes');
    assert.equal(jsonReporterOutput.stats.pending, 0, 'Reporter should contain information about all pendings');
    assert.equal(jsonReporterOutput.stats.failures, 1, 'Reporter should contain information about all failures');

    // check time diff
    var startDate = new Date(jsonReporterOutput.stats.start);
    var endDate = new Date(jsonReporterOutput.stats.end);
    var diffMs = endDate - startDate;

    assert(startDate.getTime(), 'Start date is invalid');
    assert(endDate.getTime(), 'End date is invalid');
    assert.strictEqual(diffMs >= 8000, true, 'Diff between end and start dates is too small');

    // common structure
    assert.equal(Array.isArray(jsonReporterOutput.tests), true, 'Reporter should contain tests array');
    assert.equal(Array.isArray(jsonReporterOutput.pending), true, 'Reporter should contain pendings array');
    assert.equal(Array.isArray(jsonReporterOutput.passes), true, 'Reporter should contain passes array');

    // first output should be from parallel1.js
    assert.equal(jsonReporterOutput.tests[0].fullTitle, 'Test suite #1 should end in 3 seconds', 'First output should be from parallel1.js')
    assert.equal(jsonReporterOutput.tests[0].duration >= 3000 && jsonReporterOutput.tests[0].duration < 4000, true, 'parallel1.js suite should end in 3 seconds');

    console.log(jsonReporterOutput)

    // second output should be from parallel3.js
    // because parallel1.js ended and parallel2.js is still running
    assert.equal(jsonReporterOutput.tests[1].fullTitle, 'Test suite #3 should end in 3 seconds', 'Second output should be from parallel3.js')
    assert.equal(jsonReporterOutput.tests[1].duration >= 3000 && jsonReporterOutput.tests[1].duration < 4000, true, 'parallel3.js suite should end in 3 seconds');

    // and the last output should be from parallel2.js
    assert.equal(jsonReporterOutput.tests[2].fullTitle, 'Test suite #2 should end in 5 seconds', 'Last output should be from parallel2.js')
    assert.equal(jsonReporterOutput.tests[2].duration >= 5000 && jsonReporterOutput.tests[2].duration < 6000, true, 'parallel2.js suite should end in 5 seconds');
    assert.equal(jsonReporterOutput.tests[3].fullTitle, 'Test suite #2 should fail', 'parallel2.js second test should fail');
    assert(jsonReporterOutput.tests[3].err, true, 'parallel2.js second test should fail');

    // check failure
    assert.equal(Array.isArray(jsonReporterOutput.failures), true, 'Reporter should contain failures array');
    assert.equal(jsonReporterOutput.failures.length, 1, 'Reporter should contain one error');
    assert.equal(jsonReporterOutput.failures[0].fullTitle, 'Test suite #2 should fail');
    assert.equal(jsonReporterOutput.failures[0].err.message, 'some error');
});
