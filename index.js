'use strict';

var child_process = require('child_process');
var fs = require('fs');
var path = require('path');

var glob = require('glob');
var Mocha = require('mocha');
var statSync = require('fs').statSync;
var CustomRunner = require('./lib/runner');

module.exports = function MochaParallelTests(options) {
    var _dir = String(options._);
    process.setMaxListeners(0);

    var Reporter = function (runner) {
        var Base = Mocha.reporters.Base;
        var UserReporter = require('mocha/lib/reporters/' + (options.R || 'spec'));
        var customRunner = new CustomRunner;

        UserReporter = new UserReporter(customRunner);

        var failures = [];
        var passes = [];
        var suites = [];

        Base.call(this, runner);

        runner.on('suite', function(suite) {
            suites.push(suite);
        });

        runner.on('pass', function(test) {
            passes.push(test);
        });

        runner.on('fail', function(test) {
            failures.push(test);
        });

        runner.on('end', function() {
            customRunner.start();

            suites.forEach(function (suite) {
                customRunner.suite(suite);
            });

            passes.forEach(function (test) {
                customRunner.pass(test);
            });

            failures.forEach(function (test) {
                customRunner.fail(test);
            });

            customRunner.end();
        });
    }

    options._.forEach(function (testPath) {
        glob(testPath, function (err, files) {
            if (err) {
                throw err;
            }

            files.map(function (file) {
                return path.resolve(file);
            }).filter(function (file) {
                try {
                    var test = require(file);
                    return false;
                } catch (ex) {
                    return true;
                }
            }).forEach(function (file) {
                options.reporter = Reporter;

                var mocha = new Mocha(options);
                mocha.addFile(file);
                mocha.run();
            });
        });
    });
};
