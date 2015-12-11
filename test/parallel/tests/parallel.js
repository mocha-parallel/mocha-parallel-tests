'use strict';

describe('Check tests run in parallel #1', function () {
    it('should end in 10 000 seconds #1', function (done) {
        setTimeout(function () {
            done();
        }, 10000);
    });
});
