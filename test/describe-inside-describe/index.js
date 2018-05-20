#!/usr/bin/env node

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var cheerio = require('cheerio');
var libExecutable = path.resolve(__dirname, '../../dist/bin/cli.js');

exec(libExecutable + ' -R doc --timeout 60000 --slow 30000 test/describe-inside-describe/tests', {
    cwd: path.resolve(__dirname, '../../')
}, function (err, stderr) {
    var xmlReporterOutput = stderr.toString();
    var $ = cheerio.load(xmlReporterOutput);
    var firstSuite = $('.suite .suite');

    assert.strictEqual($('.suite').length, 5, 'Suites length is wrong');
    assert.strictEqual(firstSuite.find('.suite').length, 1, 'Inner suites length is wrong');
});
