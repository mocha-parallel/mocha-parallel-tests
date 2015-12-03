'use strict';

var child_process = require('child_process');
var fs = require('fs');
var path = require('path');
var Mocha = require('mocha');

var defaults = {
    timeout: 60000,
    slow: 30000,
    reporterName: 'list'
};

var MochaParallelTests = module.exports = function (options) {
    var _dir = String(options._);

    process.setMaxListeners(0);

    options._.forEach(function (testPath) {
        var filePath = process.cwd() + '/' + testPath;

        var mocha = new Mocha({
            reporter: options.R || defaults.reporterName,
            timeout: options.timeout || defaults.timeout,
            slow: options.slow || defaults.slow
        });

        mocha.addFile(filePath);
        mocha.run();
    });
};