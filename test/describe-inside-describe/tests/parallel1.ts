'use strict';

describe('Test suite #1', function () {
    it('should end in 3 seconds', function (done) {
        setTimeout(done, 3000);
    });

    it('should end in 1 second', function (done) {
        setTimeout(done, 1000);
    });

    describe('Inner test suite', function () {
        it('should end now', function () {});
    });
});
