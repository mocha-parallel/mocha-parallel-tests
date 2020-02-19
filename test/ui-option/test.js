'use strict';

const assert = require( 'assert' ).strict.ok;

// Assert 'tdd' interface is present
assert(typeof global.suite === 'function', 'Expected global.suite() to be a function');
assert(typeof global.test === 'function', 'Expected global.test() to be a function');
