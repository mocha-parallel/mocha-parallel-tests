'use strict';

describe('Check tests run in parallel #3', function () {
    it('should end in 10 000 seconds #3', function (done) {
        setTimeout(function () {
            done();
        }, 10000);
    });
});
