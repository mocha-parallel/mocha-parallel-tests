describe('Throwing error', () => {
    for (let i = 0; i < 3; i++) {
        it(`case ${i}`, () => {
            throw new Error('foo');
        });
    }
});
