'use strict';

global[__filename] = global[__filename] || 0;

describe('suite 1', () => {
    it('should be okay during the first run', () => {
        if (global[__filename] > 0) {
            throw new Error;
        }
    });
});

describe('suite 2', () => {
    it('should be okay starting from the second run', () => {
        if (global[__filename] === 0) {
            global[__filename]++;
            throw new Error;
        }
    });
});

describe('suite 3', () => {
    it('should be okay during the first run', () => {
        if (global[__filename] > 0) {
            throw new Error;
        }
    });
});
