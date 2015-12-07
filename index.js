'use strict';

var child_process = require('child_process');
var fs = require('fs');
var Mocha = require('mocha');
var statSync = require('fs').statSync;
var CustomRunner = require('./lib/runner');

var MochaParallelTests = module.exports = function (options) {
    var _dir = String(options._);
    process.setMaxListeners(0);

    var Reporter = function (runner) {
        var Base = Mocha.reporters.Base;
        var UserReporter = require('mocha/lib/reporters/' + options.R);
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
            customRunner.start()
            suites.forEach(function (suite) {
                customRunner.suite(suite);
            });
            passes.forEach(function (test) {
                customRunner.pass(test);
            });
            failures.forEach(function (test) {
                customRunner.fail(test);
            });
            customRunner.testEnd()
        });
    }

    options._.forEach(function (testPath) {
        var isDirectory = statSync(testPath).isDirectory();
        var paths = [];

        // if directory get files
        if (isDirectory) {
            fs.readdirSync(testPath).forEach(function(file){
                if (file.substr(-3) === '.js') {
                    paths.push(testPath + '/' + file)
                }
            });
        } else {
            paths.push(testPath);
        }

        paths.forEach(function (file) {
            var filePath = process.cwd() + '/' + file;
            options.reporter = Reporter;
            var mocha = new Mocha(options);
            mocha.addFile(filePath);
            mocha.run();
        });

    });
};