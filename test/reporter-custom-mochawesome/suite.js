'use strict';

describe('Suite', function suiteName() {
    it('should finish immediately', function testCase1Name() {});
    it('should finish after 100ms', function testCase2Name(done) { setTimeout(done, 100); });
    it('should fail', function testCase3Name() { throw new Error('foo'); });
});
