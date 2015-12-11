'use strict';

describe('Check tests run in parallel #2', function () {
    it('should end in 10 000 seconds #2', function (done) {
        setTimeout(function () {
            done();
        }, 10000);
    });
});
