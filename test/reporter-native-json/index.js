#!/usr/bin/env node

const path = require('path');
const exec = require('child_process').exec;

const libExecutable = path.resolve(__dirname, '../../dist/bin/cli.js');

exec(`${libExecutable} -R json --timeout 60000 --slow 30000 test/reporter-native-json/suite.js`, {
    cwd: path.resolve(__dirname, '../../')
}, (err, stdout) => {
    if (err) {
        throw err;
    }

    try {
        JSON.parse(stdout);
    } catch (ex) {
        console.warn(`Reporter output doesn't have much common with JSON: ${stdout}`);
        process.exit(1);
    }
});
