'use strict';

for (let i = 0; i < 3; i++) {
    describe(`suite #${i}`, () => {
        it('should run its case', done => {
            setTimeout(done, 1000);
        });
    });
}
