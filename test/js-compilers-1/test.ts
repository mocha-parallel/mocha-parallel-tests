'use strict';

const assert = require('assert');
/* eslint-disable no-unused-vars */
const createElement = () => ({});
/* eslint-enable no-unused-vars */

const reactElem = <div>
    <img src="avatar.png" className="profile"/>
</div>;

describe('Test suite with specific language feature', () => {
    it('should end immediately', () => {
        assert.strictEqual(typeof reactElem, 'object');
    });
});
