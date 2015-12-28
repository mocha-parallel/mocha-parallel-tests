'use strict';

var child_process = require('child_process');
var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var Mocha = require('mocha');
var glob = require('glob');
var statSync = require('fs').statSync;
var Reporter = require('./lib/reporter');
var Watcher = require('./lib/watcher');

module.exports = function MochaParallelTests(options) {
    var _dir = String(options._);

    process.setMaxListeners(0);

    options._.forEach(function (testPath) {
        var isDirectory = statSync(testPath).isDirectory();
        if (isDirectory) {
            testPath = testPath + '/**/*.js';
        }

        glob(testPath, function (err, files) {
            if (err) {
                throw err;
            }

            // watcher monitors running files
            // and is also an EventEmitter instance
            var watcher = new Watcher(options.maxParallel);

            files.forEach(function (file, index) {
                var testOptions = _.assign({}, options, {
                    reporterName: options.R || options.reporter,
                    reporter: Reporter,
                    index: index + 1,
                    testsLength: files.length
                });

                watcher.addTest(path.resolve(file), testOptions);
            });

            watcher.run();
        });
    });
};
