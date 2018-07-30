'use strict';

const assert = require('assert');

describe('tests', () => {
    it('should be run 1. grep', () => {
        assert.ok(true);
    });

    it('should be skipped', () => {
        assert.ok(true);
    });
});

describe('tests should be run. grep', () => {
    it('should be run 2', () => {
        assert.ok(true);
    });
});
