'use strict';

const assert = require('assert');

xdescribe('skipped describe block', () => {
    it('should be skipped', () => {
        assert(false);
    });

    it('should be skipped', () => {
        assert(false);
    });
});
