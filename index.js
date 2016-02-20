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

// files lookup in mocha is complex, so it's better to just run original code
var mochaLookupFiles = require('mocha/lib/utils').lookupFiles;

function getAllFilesFromTestpath(testPath) {
    return new Promise(function (resolve, reject) {
        var isDirectory = statSync(testPath).isDirectory();
        if (isDirectory) {
            testPath = testPath + '/**/*.js';
        }
        glob(testPath, function (err, files) {
            if (err) {
                reject(err)
            } else {
                resolve(files)
            }
        });
    });
}

module.exports = function MochaParallelTests(options) {
    process.setMaxListeners(0);

    var extensions = ['js'];
    (options.compilers || []).forEach(function (compiler) {
        var compiler = c.split(':');
        var ext = compiler[0];

        extensions.push(ext);
    });

    // get test files with original mocha utils.lookupFiles() function
    var files = [];
    options._.forEach(function (testPath) {
        files = files.concat(mochaLookupFiles(testPath, extensions, options.recursive));
    });

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
};
