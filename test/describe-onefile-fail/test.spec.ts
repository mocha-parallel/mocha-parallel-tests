'use strict';

const assert = require('assert');

global[`${__filename}:suite1`] = global[`${__filename}:suite1`] || 0;
global[`${__filename}:suite2`] = global[`${__filename}:suite2`] || 0;
global[`${__filename}:suite3`] = global[`${__filename}:suite3`] || 0;

describe('suite 1', () => {
    it('should be okay during the first run', () => {
        assert.strictEqual(global[`${__filename}:suite1`], 0);
        global[`${__filename}:suite1`]++;
    });
});

describe('suite 2', () => {
    it('should be okay starting from the second run', () => {
        const suiteValue = global[`${__filename}:suite2`];

        global[`${__filename}:suite2`]++;
        assert.strictEqual(suiteValue, 1);
    });
});

describe('suite 3', () => {
    it('should be okay during the first run', () => {
        assert.strictEqual(global[`${__filename}:suite3`], 0);
        global[`${__filename}:suite3`]++;
    });
});
