'use strict';

for (let i = 0; i < 3; i++) {
    describe(`suite #${i}`, () => {
        it('should run its case', done => {
            const timeout = 1000 + Math.round(Math.random() * 1000);

            if (i === 0) {
                setTimeout(done, timeout, new Error('oops'));
            } else {
                setTimeout(done, timeout);
            }
        });
    });
}
