'use strict';

const webdriver = require('selenium-webdriver');
const test = require('selenium-webdriver/testing');

test.describe('Dynamic Loading', function () {
    test.before(() => {
        const url = 'http://ondemand.saucelabs.com:80/wd/hub';
        const builder = new webdriver.Builder().usingServer(url);

        builder.withCapabilities({
            browserName: 'chrome',
            browserVersion: '49',
            platform: 'Linux',
            username: process.env.SAUCE_USERNAME,
            accessKey: process.env.SAUCE_ACCESS_KEY
        });

        const driverFactory = builder.build();
    });

    test.it('should wait for beforeEach', () => {});
});
