describe('Throwing error', () => {
    before(() => {});
    after(() => {});
    afterEach(() => {});

    it('error', () => {
        console.log('Ready to throw error');
        throw new Error('foo');
    });
});
