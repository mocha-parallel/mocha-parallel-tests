'use strict';

for (let i = 0; i < 3; i++) {
    describe(`suite #${i}`, () => {
        it('should run its case', done => {
            if (i === 0) {
                setTimeout(done, 1000, new Error('oops'));
            } else {
                setTimeout(done, 1000);
            }
        });
    });
}
