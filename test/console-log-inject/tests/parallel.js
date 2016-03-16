'use strict';

describe('Suite #1', function () {
    console.log('suite #1 log at the beginning');

    it('should end in 3 seconds', function (done) {
        console.log('suite #1 test #1 log at the beginning');

        setTimeout(function () {
            console.log('suite #1 test #1 log before end');
            done();
        }, 3000);
    });

    console.log('suite #1 log at the end');
});
