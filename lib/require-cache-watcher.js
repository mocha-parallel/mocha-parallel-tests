'use strict';

import debug from 'debug';
import {relative} from 'path';

const debugLog = debug('mocha-parallel-tests:cache');

/**
 * It's important to watch for require.cache during mocha tests run
 * This helper is here to help: it starts watching required files when
 * you call start(), stops watching when you call stop() and flushes them
 * from require.cache when you call flushRequireCache()
 */
const difference = (a, b) => {
    const aSet = new Set(a);
    const bSet = new Set(b);

    const diffElementsSet = new Set(
        [
            ...a.filter(x => !bSet.has(x)),
            ...b.filter(x => !aSet.has(x)),
        ]
    );

    return [...diffElementsSet];
};

class RequireCacheWatcher {
    start() {
        this._cached = this._getRequireCache();
    }

    stop() {
        this._newCached = this._getRequireCache();
    }

    flushRequireCache() {
        const diff = difference(this._cached, this._newCached);

        for (let filePath of diff) {
            const isInternalDependency = this._isInternalDependency(filePath);

            if (!isInternalDependency) {
                debugLog(`Flush ${filePath} from cache`);
                delete require.cache[filePath];
            }
        }
    }

    _getRequireCache() {
        return Object.keys(require.cache);
    }

    _isInternalDependency(filePath) {
        // "../../node_modules/moment/..." -> "mode_modules/moment/..."
        const relativePath = relative(__filename, filePath).replace(/\.\.\//g, '');
        return relativePath.includes('node_modules', 1);
    }
}

export default RequireCacheWatcher;
