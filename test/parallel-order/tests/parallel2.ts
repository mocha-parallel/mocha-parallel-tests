'use strict';

describe('Test suite #2', function () {
    it('should end in 5 seconds', function (done) {
        setTimeout(done, 5000);
    });

    it('should fail', function (done) {
        done(new Error('some error'));
    });
});
