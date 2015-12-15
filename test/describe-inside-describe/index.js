#!/usr/bin/env node

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var cheerio = require('cheerio');
var libExecutable = path.resolve(__dirname, '../../bin/mocha-parallel-tests');

exec(libExecutable + ' -R doc --timeout 60000 --slow 30000 test/describe-inside-describe/tests', {
    cwd: path.resolve(__dirname, '../../')
}, function (err, stderr) {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    var xmlReporterOutput = stderr.toString();
    var $ = cheerio.load(xmlReporterOutput);
    var firstSuite = $('.suite');
    var secondSuite = $('.suite').eq(-1);

    assert.strictEqual($('.suite').length, 3, 'Suites length is wrong');
    assert.strictEqual(firstSuite.find('.suite').length, 1, 'Inner suites length is wrong');
});
