describe('suite', function () {
    it('case 1', function () {
        throw new Error('foo');
    });

    // eslint-disable-next-line no-unused-vars
    it('case 2', function (done) {
        setTimeout(() => {
            throw new Error('foo');
        }, 100);
    });

    it('case 3', () => {});

    it('case 4', () => {
        return new Promise(() => {
            throw new Error('foo');
        });
    });
});
