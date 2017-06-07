'use strict';

import * as debug from 'debug';
import { relative } from 'path';

const debugLog = debug('mocha-parallel-tests:cache');

/**
 * It's important to watch for require.cache during mocha tests run
 * This helper is here to help: it starts watching required files when
 * you call start(), stops watching when you call stop() and flushes them
 * from require.cache when you call flushRequireCache()
 */
const difference = (a: string[], b: string[]): string[] => {
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
  private cache: string[];
  private namedMarks: Map<string, string[]>;

	start() {
		this.cache = this.getRequireCache();
		this.namedMarks = new Map;
	}

	getStateMark() {
		const mark = `mark_${Date.now()}_${Math.random()}`;
		this.namedMarks.set(mark, this.getRequireCache());

		return mark;
	}

	flushRequireCache(stateMark: string) {
		const markRelatedCache = this.namedMarks.get(stateMark);
		const diff = difference(this.cache, markRelatedCache);

		for (let filePath of diff) {
			const isInternalDependency = this.isInternalDependency(filePath);

			if (!isInternalDependency && !/\.node$/.test(filePath)) {
				debugLog(`Flush ${filePath} from cache`);
				delete require.cache[filePath];
			}
		}
	}

	private getRequireCache(): string[] {
		return Object.keys(require.cache);
	}

	private isInternalDependency(filePath: string): boolean {
		// "../../node_modules/moment/..." -> "mode_modules/moment/..."
		const relativePath = relative(__filename, filePath).replace(/\.\.\//g, '');
		return relativePath.includes('node_modules', 1);
	}
}

export default RequireCacheWatcher;
