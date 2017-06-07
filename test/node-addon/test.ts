var assert = require('assert');
var test_addon = require('test_addon');

describe('node binary addon test', function(){
    it('test_addon.strlen', function(){
        assert(test_addon.strlen('hello')==5);
    });
});
