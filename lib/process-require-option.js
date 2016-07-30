'use strict';

import {resolve} from 'path';
import {statSync} from 'fs';

const originalRequire = require;
const existsSync = (path) => {
    try {
        statSync(path);
        return true;
    } catch (ex) {
        return false;
    }
};

export default function ({require}) {
    if (!require) {
        return;
    }

    const requiredFiles = Array.isArray(require) ? require : [require];
    for (let requiredFile of requiredFiles) {
        const fileExists = existsSync(requiredFile) || existsSync(`${requiredFile}.js`);

        if (fileExists) {
            requiredFile = resolve(requiredFile);
        }

        originalRequire(requiredFile);
    }
}
