#!/usr/bin/env node

var assert = require('assert');
var path = require('path');
var libExecutable = path.resolve(__dirname, '../../dist/bin/cli.js');
const {exec, execSync} = require('child_process');

function getMajorMochaVersion() {
    const mochaExec = path.resolve(__dirname, '../../node_modules/.bin/mocha');
    const version = execSync(`${mochaExec} --version`).toString('utf-8').trim();

    return Number(version.split('.')[0]);
}

function getMajorNodeVersion() {
    return Number(process.versions.node.split('.')[0]);
}

function main() {
    const majorNodeVersion = getMajorNodeVersion();
    const majorMochaVersion = getMajorMochaVersion();
    const shouldProduceFullTrace = !(majorMochaVersion >= 7 && majorNodeVersion < 12);

    if (!shouldProduceFullTrace) {
        console.warn(`This test does not work on this environment: ${JSON.stringify({ majorNodeVersion, majorMochaVersion })}`);
        return;
    }

    exec(libExecutable + ' --full-trace --reporter json test/full-trace/index.spec.js', {
        cwd: path.resolve(__dirname, '../../')
    }, function (err, stderr) {
        var jsonReporterOutput = stderr.toString();

        try {
            jsonReporterOutput = JSON.parse(jsonReporterOutput);
        } catch (ex) {
            console.error('Native JSON reporter output is not valid JSON: ' + jsonReporterOutput);
            process.exit(1);
        }

        const { stack } = jsonReporterOutput.failures[0].err;
        assert(stack.split('\n').length > 2, `Stack doesn't look full: ${stack}`);
    });
}

main();
