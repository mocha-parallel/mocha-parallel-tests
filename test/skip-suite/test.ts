'use strict';

const assert = require('assert');

describe.skip('skipped describe block with describe.skip', () => {
    it('should be skipped', () => {
        assert(false);
    });

    it('should be skipped', () => {
        assert(false);
    });
});

xdescribe('skipped describe block with xdescribe', () => {
    it('should be skipped', () => {
        assert(false);
    });

    it('should be skipped', () => {
        assert(false);
    });
});

xcontext('skipped describe block with xcontext', () => {
    it('should be skipped', () => {
        assert(false);
    });

    it('should be skipped', () => {
        assert(false);
    });
});
