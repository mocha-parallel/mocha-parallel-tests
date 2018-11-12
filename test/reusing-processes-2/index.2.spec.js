describe('suite 2', () => {
    it('output pid', (done) => {
        console.log('pid:', process.pid);
        setTimeout(done, 2000);
    });
});
