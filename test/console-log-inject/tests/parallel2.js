'use strict';

describe('Test suite #2', function () {
    it('should end in 5 seconds', function (done) {
        console.log('suite #2 log');

        setTimeout(function () {
            console.log('suite #2 log');
            done();
        }, 5000);
    });
});
