describe('boom', () => {
    beforeEach(async () => {
        setTimeout(() => {
            throw new Error('boom!');
        }, 1);
    });

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
