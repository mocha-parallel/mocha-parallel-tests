#!/usr/bin/env node

'use strict';

const { existsSync } = require('fs');
const os = require('os');
const path = require('path');
const exec = require('child_process').exec;

const fileBasePath = `${os.tmpdir()}/${Date.now()}`;
const libExecutable = path.resolve(__dirname, '../../../dist/bin/cli.js');

exec(`${libExecutable} -R mochawesome --reporter-options reportFilename=${fileBasePath},json=true,html=false test/reporter-options/spec.js`, {
    cwd: path.resolve(__dirname, '../../../'),
}, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    if (!existsSync(`${fileBasePath}.json`)) {
        console.error('JSON file doesn\'t exist');
        process.exit(1);
    }

    if (existsSync(`${fileBasePath}.html`)) {
        console.error('HTML file unexpectedly exists');
        process.exit(1);
    }
});
