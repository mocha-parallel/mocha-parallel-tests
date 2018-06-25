const { reject } = require('q');

describe('suite', function () {
    it('case', function () {
        reject(new Error('foo'));
    });
});
