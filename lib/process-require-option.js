'use strict';

import prepareRequire from './prepare-require';

const originalRequire = require;

export default function ({require}) {
    if (!require) {
        return;
    }

    const requiredFiles = Array.isArray(require) ? require : [require];
    for (let requiredFile of requiredFiles) {
        originalRequire(prepareRequire(requiredFile));
    }
}
