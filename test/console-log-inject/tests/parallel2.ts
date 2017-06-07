'use strict';

describe('Suite #2', function () {
    it('should end in 5 seconds', function (done) {
        console.log('suite #2 test #1 log at the beginning');

        setTimeout(function () {
            console.log('suite #2 test #1 log before end');
            done();
        }, 5000);
    });
});
