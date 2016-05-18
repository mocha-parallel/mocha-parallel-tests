## 0.4.2

 * fix: tests using `--max-parallel=1` run without errors ([#34](https://github.com/mmotkina/mocha-parallel-tests/issues/34))

## 0.4.1

 * fix: reporters with own options like `xunit` don't produce errors now ([#31](https://github.com/mmotkina/mocha-parallel-tests/issues/31))

## 0.4.0

 * **new**: support for mocha `--compilers` option introduced
 * fix: `--retry` option is now working for mocha test hooks (before/after/etc)
 * `mocha-parallel-tests` code is now ES2015-compatible

## 0.3.x

 * fix: runner displays right tests execution time now ([#24](https://github.com/mmotkina/mocha-parallel-tests/issues/24))
 * fix: exit codes are now the same as in original mocha runner ([#27](https://github.com/mmotkina/mocha-parallel-tests/issues/27))
 * bump `mocha` version to 2.4.5. Check its [changelog](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md) for more info. Previous version was 2.3.4.

## 0.2.x

 * **new**: `--retry <num>` to set number of retries for failing tests (0 by default)

## 0.1.x

 * fix: `console.log|error`s from tests do not cross with each other. Instead they are waiting until proper test starts executing :smiley:
 * fix: support stack trace of errors
 * fix: support for incoming array of files
 * fix: `--max-parallel` option introduced bug when some of the files were not tests: not all tests could run
 * **new**: `--max-parallel <num>` to set max number of running parallel tests

## 0.0.x

 * fix emits of end events
 * tests for package
 * changed readme and refactoring
 * reporter control added
 * first release :smiley:
