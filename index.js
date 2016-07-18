'use strict';

import child_process from 'child_process';
import {statSync} from 'fs';
import path from 'path';
import Mocha from 'mocha';

import Reporter from './lib/reporter';
import {
    addTest,
    runTests,
    setOptions as setWatcherOptions
} from './lib/watcher';

// files lookup in mocha is complex, so it's better to just run original code
import {lookupFiles as mochaLookupFiles} from 'mocha/lib/utils';

export default function MochaParallelTests(options) {
    process.setMaxListeners(0);

    if (typeof options.compilers === 'string') {
        options.compilers = [options.compilers];
    }

    const extensions = ['js'];
    (options.compilers || []).forEach(compiler => {
        const compilerName = compiler.split(':');
        const ext = compilerName[0];

        extensions.push(ext);
    });

    // get test files with original mocha utils.lookupFiles() function
    let files = [];
    options._.slice(2).forEach(testPath => {
        files = files.concat(mochaLookupFiles(testPath, extensions, options.recursive));
    });

    // watcher monitors running files
    setWatcherOptions({
        maxParallelTests: options.maxParallel,
        retryCount: options.retry
    });

    files.forEach(file => {
        const testOptions = Object.assign({}, options, {
            reporterName: options.R || options.reporter,
            reporter: Reporter,
            testsLength: files.length
        });

        addTest(path.resolve(file), testOptions);
    });

    runTests();
}
