const assert = require('assert');
let run = 0;

describe('suite', () => {
    it('case', () => {
        run++;
        assert(run === 3);
    });
});
