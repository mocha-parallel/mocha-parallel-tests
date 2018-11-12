describe('Throwing error', () => {
    it('should throw', () => {
        function x() {
            throw new Error('foo');
        }
        x();
    });
});
