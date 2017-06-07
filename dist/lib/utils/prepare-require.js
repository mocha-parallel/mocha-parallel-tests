"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Mocha is often passed files to require through its options
 * One should detect under the hood if it's an existing file or a module
 * This file helps with this problem
 */
const path_1 = require("path");
const fs_1 = require("fs");
const existsSync = (path) => {
    try {
        fs_1.statSync(path);
        return true;
    }
    catch (ex) {
        return false;
    }
};
function default_1(requiredFile) {
    const fileExists = existsSync(requiredFile) || existsSync(`${requiredFile}.js`);
    return fileExists ? path_1.resolve(requiredFile) : requiredFile;
}
exports.default = default_1;
