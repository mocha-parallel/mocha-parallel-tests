'use strict';

describe('Test suite #1', function () {
    it('should end in 3 seconds', function (done) {
        console.log('suite #1 log');

        setTimeout(function () {
            console.log('suite #1 log');
            done();
        }, 3000);
    });
});
