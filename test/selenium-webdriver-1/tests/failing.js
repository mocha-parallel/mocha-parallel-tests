'use strict';

const webdriver = require('selenium-webdriver');
const test = require('selenium-webdriver/testing');

const seleniumHost = process.env.SELENIUM_HOST || 'ondemand.saucelabs.com:80';
const seleniumUrl = `http://${seleniumHost}/wd/hub`;
const browserName = process.env.BROWSER || 'chrome';
const suiteName = 'Parallel 3';
let driver;

test.describe(suiteName, function () {
    test.beforeEach(function () {
        driver = new webdriver.Builder()
            .usingServer(seleniumUrl)
            .withCapabilities({
                browserName,
                username: process.env.SAUCE_USERNAME,
                accessKey: process.env.SAUCE_ACCESS_KEY
            })
            .build();
    });

    test.it('should fail', function () {
        driver.get('http://www.google-xxx-22.com3');
        driver.findElement(webdriver.By.name('q'));
    });
    
    test.afterEach(function () {
        driver.quit();
    });
});
