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
        this._namedMarks = new Map;
    }

    getStateMark() {
        const mark = `mark_${Date.now()}_${Math.random()}`;
        this._namedMarks.set(mark, this._getRequireCache());

        return mark;
    }

    flushRequireCache(stateMark) {
        const markRelatedCache = this._namedMarks.get(stateMark);
        const diff = difference(this._cached, markRelatedCache);

        for (let filePath of diff) {
            const isInternalDependency = this._isInternalDependency(filePath);

            if (!isInternalDependency && !/\.node$/.test(filePath)) {
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
