'use strict';

before(() => {
    console.log('run global before hook');
    throw new Error('foo');
});

after(() => {
    console.log('run global after hook');
    throw new Error('bar');
});
