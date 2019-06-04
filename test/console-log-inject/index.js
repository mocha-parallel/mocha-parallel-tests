#!/usr/bin/env node

'use strict';

var assert = require('assert');
var path = require('path');
var exec = require('child_process').exec;
var mptExecutable = path.resolve(__dirname, '../../dist/bin/cli.js');

const runTests = (libExecutable) => {
    return new Promise((resolve, reject) => {
        exec(`${libExecutable} --timeout 60000 --slow 30000 test/console-log-inject/tests`, {
            cwd: path.resolve(__dirname, '../../')
        }, function (err, stdout) {
            if (err) {
                reject(err);
                return;
            }
        
            const logs = stdout.toString().split('\n').reduce(function (logs, chunk) {
                chunk = chunk.trim();
        
                if (/^suite\s#[\d]+/i.test(chunk)) {
                    logs.push(chunk.toLowerCase());
                }
        
                return logs;
            }, []);

            resolve(logs);
        });
    });
};

Promise.all([
    runTests(mptExecutable),
    runTests('mocha'),
]).then(([logsParallel, logsBasic]) => {
    assert.deepStrictEqual(
        logsParallel,
        logsBasic,
        `Logs are different. Parallel: ${JSON.stringify(logsParallel)}. Basic: ${JSON.stringify(logsBasic)}`,
    );
}).catch((ex) => {
    console.error(ex);
    process.exit(1);
});
