const { writeFileSync } = require('fs');
const { resolve } = require('path');

const updateCounterWithOwnPid = () => {
    const counterFilePath = resolve(__dirname, '../counter.json');
    const pids = new Set(require(counterFilePath));

    pids.add(process.pid);
    writeFileSync(counterFilePath, JSON.stringify([...pids]));
};

describe('suite', () => {
    it('case', (done) => {
        updateCounterWithOwnPid();
        setTimeout(done, 1000);
    });
});
