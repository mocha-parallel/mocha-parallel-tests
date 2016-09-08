'use strict';

const webdriver = require('selenium-webdriver');
const test = require('selenium-webdriver/testing');

const seleniumHost = process.env.SELENIUM_HOST || 'ondemand.saucelabs.com:80';
const seleniumUrl = `http://${seleniumHost}/wd/hub`;
const browserName = process.env.BROWSER || 'chrome';

test.describe('Failing suite', function () {
    let driver;

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
            
        const searchBox = driver.findElement(webdriver.By.name('q'));
        searchBox.sendKeys('some combination');
    });
    
    test.afterEach(function () {
        driver.quit();
    });
});
