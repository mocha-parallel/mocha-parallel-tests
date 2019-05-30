const assert = require('assert');
const microtime = require('microtime');

describe('native module', () => {
    it('microtime', () => {
        assert.strictEqual(typeof microtime.now(), 'number');
    });
});
