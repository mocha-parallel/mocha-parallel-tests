describe('boom', () => {
    beforeEach(async () => {
        setTimeout(() => {
            throw new Error('boom!');
        }, 1);
    });

    // beforeEach(function () {
    //     return new Promise(() => {
    //         setTimeout(() => {
    //             throw new Error('boom!');
    //         }, 1);
    //     });
    // });

    // beforeEach(function () {
    //     return new Promise((resolve, reject) => {
    //         setTimeout(() => {
    //             const err = new Error('boom!');
    //             reject(err);
    //         }, 1);
    //     });
    // });
  
    describe('nested describe', () => {
        it('should pass #1', () => {
            // pass
        });

        it('should pass #2', () => {
            // pass
        });

        it('should pass #3', () => {
            // pass
        });
    });
});
