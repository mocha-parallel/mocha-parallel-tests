'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const webdriver = require('selenium-webdriver');

const test = require('selenium-webdriver/testing');
const tmpFile = path.join(os.tmpDir(), 'selenium-webdriver.json');

const readTmpFile = () => {
    return JSON.parse(fs.readFileSync(tmpFile, {encoding: 'utf-8'}));
};

// delete file if it exists
try {
    fs.unlinkSync(tmpFile);
} catch (ex) {
    // pass
}

const beforeEach = (testId) => {
    return () => {
        // set information about running test to file
        let json;
        try {
            json = readTmpFile();
        } catch (ex) {
            json = {tests: []};
        }

        json.tests.push(testId);
        fs.writeFileSync(tmpFile, JSON.stringify(json));

        // connect to SauceLabs
        const url = 'http://ondemand.saucelabs.com:80/wd/hub';
        const builder = new webdriver.Builder().usingServer(url);

        builder.withCapabilities({
            browserName: 'chrome',
            browserVersion: '49',
            platform: 'Linux',
            username: process.env.SAUCE_USERNAME,
            accessKey: process.env.SAUCE_ACCESS_KEY
        });

        builder.build();
    };
};

let afterEach = () => {
    const json = readTmpFile();
    json.tests.pop();

    assert.strictEqual(json.tests.length, 1, `Currently running tests number is wrong: ${json.tests.length}`);

    // there's no need to check next afterEach
    afterEach = () => {};
};

test.describe('Dynamic Loading #1', function () {
    test.beforeEach(beforeEach('Dynamic Loading #1'));
    test.afterEach(afterEach);

    test.it('should wait for beforeEach', () => {});
});

test.describe('Dynamic Loading #2', function () {
    test.beforeEach(beforeEach('Dynamic Loading #2'));
    test.afterEach(afterEach);

    test.it('should wait for beforeEach', () => {});
});
