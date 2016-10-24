'use strict';

/* globals allure */
describe('Check if custom reporter used', function () {
    it('should use mocha-jenkins-reporter reporter', function () {
        allure.feature('featureName');
    });
});
