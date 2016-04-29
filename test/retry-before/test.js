'use strict';

global.__retryBeforeCounter = global.__retryBeforeCounter || 0;

describe('Test suite', () => {
    before(() => {
        if (global.__retryBeforeCounter === 0) {
            global.__retryBeforeCounter++;
            throw new Error('First launch');
        }
    });

    it('should end immediately', () => {});
});
