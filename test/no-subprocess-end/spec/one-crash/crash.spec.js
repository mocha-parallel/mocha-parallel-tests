describe('suite', () => {
    it('should pass', () => {});

    // eslint-disable-next-line no-unused-vars
    it('should exit after a 100ms', (done) => {
        setTimeout(() => {
            process.exit(255);
        }, 100);
    });
});
