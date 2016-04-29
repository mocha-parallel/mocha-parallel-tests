## 0.4.0

 * **new**: support for mocha `--compilers` option introduced
 * fix: `--retry` option is now working for mocha test hooks (before/after/etc)
 * `mocha-parallel-tests` code is now ES2015-compatible

## 0.3.2

 * fix: runner displays right tests execution time now (#24)
 * fix: exit codes are now the same as in original mocha runner (#27)

## 0.3.0

 * bump `mocha` version to 2.4.5. Check its [changelog](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md) for more info. Previous version was 2.3.4.

## 0.2.0

 * **new**: `--retry <num>` to set number of retries for failing tests (0 by default)

## 0.1.4

 * fix: `console.log|error`s from tests do not cross with each other. Instead they are waiting until proper test starts executing :smiley:

## 0.1.3

 * fix: support stack trace of errors

## 0.1.2

 * fix: support for incoming array of files

## 0.1.1

 * fix: `--max-parallel` option introduced bug when some of the files were not tests: not all tests could run

## 0.1.0

 * **new**: `--max-parallel <num>` to set max number of running parallel tests

## 0.0.14

 * fix emits of end events

 ## 0.0.7

 * tests for package

## 0.0.6

 * changed readme and refactoring

## 0.0.5

 * reporter control added

## 0.0.3

 * first release :smiley:
