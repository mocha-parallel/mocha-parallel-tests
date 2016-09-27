'use strict';

const assert = require('assert');
const webdriver = require('selenium-webdriver');
const test = require('selenium-webdriver/testing');

const seleniumHost = process.env.SELENIUM_HOST || 'ondemand.saucelabs.com:80';
const seleniumUrl = `http://${seleniumHost}/wd/hub`;
const browserName = process.env.BROWSER || 'chrome';
const suiteName = 'Parallel 2';
let driver;

require('./hooks');

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

    for (let i = 1; i <= 3; i++) {
        test.it(`test case ${i}`, function () {
            driver.get('http://www.google.com');
            
            const searchBox = driver.findElement(webdriver.By.name('q'));
            const keysSeq = `${suiteName} - ${i}`;

            searchBox.sendKeys(keysSeq);
            searchBox.getAttribute('value').then(function (value) {
                assert.strictEqual(value, keysSeq);
            });

            driver.sleep(1000);
        });
    }
    
    test.afterEach(function () {
        driver.quit();
    });
});
