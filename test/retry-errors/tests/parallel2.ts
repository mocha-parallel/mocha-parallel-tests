'use strict';

// this is the place where variables are not cleared between tests
global.__counter = global.__counter || 0;

describe('Test suite #2', function () {
    it('should end now', function () {});

    it('should end in 1 second', function (done) {
        setTimeout(function () {
            global.__counter++;

            if (global.__counter % 3 === 0) {
                done();
            } else {
                done(new Error('Oops, flaky error occured: ' + global.__counter));
            }
        }, 1000);
    });
});
