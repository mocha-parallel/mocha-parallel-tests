'use strict';

const assert = require('assert');

describe('describe block', () => {
    xit('should be skipped with xit', () => {
        assert(false);
    });

    xspecify('should be skipped with xspecify', () => {
        assert(false);
    });

    it.skip('should be skipped with it.skip', () => {
        assert(false);
    });
});
