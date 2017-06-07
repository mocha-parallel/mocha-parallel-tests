'use strict';

describe('Test suite #1', function () {
    it('should end now', function () {});

    it('should end shortly', function () {
        describe('Inner suite #1', function () {
            it('should end now', function () {});
        });
    });
});
