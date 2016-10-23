'use strict';

/**
 * Mocha is often passed files to require through its options
 * One should detect under the hood if it's an existing file or a module
 * This file helps with this problem
 */
import {resolve} from 'path';
import {statSync} from 'fs';

const existsSync = (path) => {
    try {
        statSync(path);
        return true;
    } catch (ex) {
        return false;
    }
};

export default function (requiredFile) {
    const fileExists = existsSync(requiredFile) || existsSync(`${requiredFile}.js`);
    return fileExists ? resolve(requiredFile) : requiredFile;
}
