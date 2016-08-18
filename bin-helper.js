'use strict';

import path from 'path';
import Reporter from './lib/reporter';
import prepareRequire from './lib/prepare-require';
import RequireCacheWatcher from './lib/require-cache-watcher';
import {
    patch as patchGlobalHooks,
    restore as restoreGlobalHooks
} from './lib/hooks';

import {
    addTest,
    runTests,
    setOptions as setWatcherOptions
} from './lib/watcher';

// files lookup in mocha is complex, so it's better to just run original code
import {lookupFiles as mochaLookupFiles} from 'mocha/lib/utils';

export default function binHelper(options) {
    process.setMaxListeners(0);

    if (typeof options.compilers === 'string') {
        options.compilers = [options.compilers];
    }

    const extensions = ['js'];
    (options.compilers || []).forEach(compiler => {
        const [ext, mod] = compiler.split(':');
        let compilerMod = mod;

        if (mod[0] === '.') {
            compilerMod = path.join(process.cwd(), mod);
        }

        require(prepareRequire(compilerMod));
        extensions.push(ext);
    });

    // get test files with original mocha utils.lookupFiles() function
    let files = [];
    (options._ || []).slice(2).forEach(testPath => {
        files = files.concat(mochaLookupFiles(testPath, extensions, options.recursive));
    });

    // watcher monitors running files
    setWatcherOptions({
        maxParallelTests: options.maxParallel,
        retryCount: options.retry
    });

    // require(testFile) needs some global hooks (describe, it etc)
    patchGlobalHooks();

    const cacheWatcher = new RequireCacheWatcher;
    cacheWatcher.start();

    files.forEach(file => {
        // does this file have a syntax error?
        // require() will show that
        const absFilePath = path.resolve(file);
        require(absFilePath);

        addTest(absFilePath);
    });

    // okay, all files are valid JavaScript
    // now it's time for mocha to set its own global hooks
    restoreGlobalHooks();

    // also we need to delete files from require.cache
    // which are involved into all tests
    cacheWatcher.stop();
    cacheWatcher.flushRequireCache();

    runTests({
        options: Object.assign({}, options, {
            reporterName: options.R || options.reporter,
            reporter: Reporter,
            testsLength: files.length
        })
    });
}
