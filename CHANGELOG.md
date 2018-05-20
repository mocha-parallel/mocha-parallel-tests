## 2.0.0

More: https://github.com/yandex/mocha-parallel-tests/wiki/v2-release-notes

## 1.2.10

 * fix: support `--no-timeouts` option ([#120](https://github.com/yandex/mocha-parallel-tests/issues/120))

## 1.2.9

 * fix: support only latest (3.x) `mocha` versions ([#98](https://github.com/yandex/mocha-parallel-tests/issues/98))
 * fix: support `reporter.done()` callback for all external reporters (`mochawesome` for example) in both CLI and node.js API ([#113](https://github.com/yandex/mocha-parallel-tests/issues/113))

## 1.2.8

 * fix: do not fail if no target is set and `--recursive` option is used ([#94](https://github.com/yandex/mocha-parallel-tests/issues/94))

## 1.2.7

 * fix: add support for `xdescribe`, `xcontext`, `xspecify`, `xit` and `it.skip` ([#102](https://github.com/yandex/mocha-parallel-tests/issues/102))
 * most of packages dependencies upgrade (minor changes)

## 1.2.6

 * fix: tests with binary dependencies can now be used with `mocha-parallel-tests` ([#100](https://github.com/yandex/mocha-parallel-tests/issues/100))

## 1.2.5

 * fix: if file contains multiple `describe()` sections in it, one of it fails and `mocha-parallel-tests` is executed with `--retry` option, only this failed section is re-executed ([#77](https://github.com/yandex/mocha-parallel-tests/issues/77))

## 1.2.4

 * fix: `--no-exit` CLI option is supported ([#85](https://github.com/yandex/mocha-parallel-tests/issues/85))

## 1.2.3

 * fix: pwd-based reporters (located somewhere inside your repo) are supported ([#75](https://github.com/yandex/mocha-parallel-tests/issues/75))
 * fix: `tap` and other reporters which use mocha's `runner` object are supported ([#78](https://github.com/yandex/mocha-parallel-tests/issues/78))
 * fix: `mocha-jenkins-reporter`is supported ([#81](https://github.com/yandex/mocha-parallel-tests/issues/81))

## 1.2.2

 * fix: `selenium-webdriver` issue with number of tests is fixed ([#69](https://github.com/yandex/mocha-parallel-tests/issues/69)). Currently all `selenium-webdriver` tests should work as expected.

## 1.2.1

 * fix: `--require`'d files are working as expected together with `--compilers` option ([#63](https://github.com/yandex/mocha-parallel-tests/issues/63))

## 1.2.0

 * **new**: using mocha-parallel-tests programmatically is now supported. You can also pass own mocha-parallel-tests options by calling `setOwnOptions({maxParallel, retry})` method of mocha-parallel-tests instance. You should call it before `run()`.

## 1.1.x

 * **breaking change**: `mocha` is now in peerDependencies part of `mocha-parallel-tests` which means that you need to add both `mocha` and `mocha-parallel-tests` in your project's package.json. This also means that you can run both of your tests: written for mocha@2.x and mocha@3.x ([#55](https://github.com/yandex/mocha-parallel-tests/issues/55))
 * fix: support for only() and skip() helpers ([#59](https://github.com/yandex/mocha-parallel-tests/issues/59))
 * fix: main package file now refers to CommonJS file, not ES6 module.

Version number is 1.1.0 because first `mocha-parallel-tests` releases had 1.0.x versioning scheme.

## 0.5.x

 * **new**: mutiple test suites (describe) inside one file run in parallel
 * fix: support mocha `--compilers` option ([#53](https://github.com/yandex/mocha-parallel-tests/issues/53)). `0.4.x` lacked support for JavaScript files.
 * fix: support mocha `--require` option
 * fix: support [mocha.opts](https://mochajs.org/#mochaopts) config file ([#44](https://github.com/yandex/mocha-parallel-tests/issues/44))
 * fix: global hooks stored inside separate files are now executed if target is directory ([#41](https://github.com/yandex/mocha-parallel-tests/issues/41))
 * fix: global hooks stored inside separate files are now executed ([#39](https://github.com/yandex/mocha-parallel-tests/issues/39))

## 0.4.x

 * **new**: support for mocha `--compilers` option introduced
 * fix: tests using `--max-parallel=1` run without errors ([#34](https://github.com/yandex/mocha-parallel-tests/issues/34))
 * fix: reporters with own options like `xunit` don't produce errors now ([#31](https://github.com/yandex/mocha-parallel-tests/issues/31))
 * fix: `--retry` option is now working for mocha test hooks (before/after/etc)
 * `mocha-parallel-tests` code is now ES2015-compatible

## 0.3.x

 * fix: runner displays right tests execution time now ([#24](https://github.com/yandex/mocha-parallel-tests/issues/24))
 * fix: exit codes are now the same as in original mocha runner ([#27](https://github.com/yandex/mocha-parallel-tests/issues/27))
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
