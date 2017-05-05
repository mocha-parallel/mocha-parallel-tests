'use strict';

for (let i = 0; i < 100; i++) {
    describe(`Test suite #1 - ${i}`, function () {
        it('should end after 3 seconds', function (done) {
            setTimeout(done, 3000);
        });
    });
}
