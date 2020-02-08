## 2.3.0

* new: `mocha=7` is supported
* fix: `--file` option is not supported ([#222](https://github.com/mocha-parallel/mocha-parallel-tests/issues/222))
* fix: security warnings
* trivial: local development Node.JS version is updated to 13

## 2.2.2

* fix: `mocha-parallel-tests` no longer reequire implicit `tslib` dependency ([#262](https://github.com/mocha-parallel/mocha-parallel-tests/issues/262))

## 2.2.1

* fix: TTY-related issue where users of Node.JS>=12 could see an error "TypeError: tty.getWindowSize is not a function" ([#247](https://github.com/mocha-parallel/mocha-parallel-tests/issues/247))
* chore: last tslint comments removed from the code, `mocha-parallel-tests` Typescript code and Javascript tests are now linted completely by `eslint` ([#242](https://github.com/mocha-parallel/mocha-parallel-tests/issues/242))
* chore: `mocha-parallel-tests` are now also executed in OSX via Travis CI

## 2.2.0

* new: `mocha-parallel-tests` now forks light threads instead of fully fledged Node.JS processes in environments where [worker_threads](https://nodejs.org/api/worker_threads.html) API is supported. Usually it's Node.JS >= 12. This results in a faster tests processing and less memory consumption.

## 2.1.2

* fix: programmatic API doesn't emit particular suites when multiple suites share the name ([#237](https://github.com/mocha-parallel/mocha-parallel-tests/issues/237))

## 2.1.1

* fix: `--reporter-options` doesn't work with mocha@6 ([#202](https://github.com/mocha-parallel/mocha-parallel-tests/issues/202))
* fix: npm install audio warnings because of the outdated dependencies

## 2.1.0

 * new: `mocha=6` is supported ([#217](https://github.com/mocha-parallel/mocha-parallel-tests/issues/217))
 * fix: `--retries` throws an unhandled exception when test cases are defined in a loop ([#194](https://github.com/mocha-parallel/mocha-parallel-tests/issues/194))
 * fix: `-g` alias for `--grep` is not supported ([#203](https://github.com/mocha-parallel/mocha-parallel-tests/issues/203))
 * fix: `--full-trace` option is not supported ([#202](https://github.com/mocha-parallel/mocha-parallel-tests/issues/202))
 * fix: `--exit` option leaves no trace for some asynchronously running tests ([#202](https://github.com/mocha-parallel/mocha-parallel-tests/issues/202))
 * remove: `crypto` library usage
 * linting is all done by `eslint` now.

## 2.0.5

 * fix: `--retries` with hooks throws an unhandled exception ([#194](https://github.com/mocha-parallel/mocha-parallel-tests/issues/194))

## 2.0.4

 * new: `--grep` option is now supported for both CLI and API ([#187](https://github.com/mocha-parallel/mocha-parallel-tests/pull/187), [#188](https://github.com/mocha-parallel/mocha-parallel-tests/pull/188))

## 2.0.3

 * fix: subprocess processing should not stop when unhandled rejection occurs ([#173](https://github.com/mocha-parallel/mocha-parallel-tests/issues/173))
 * fix: subprocess processing should not stop when uncaught exception occurs ([#172](https://github.com/mocha-parallel/mocha-parallel-tests/issues/172))
 * added a [list of limitations](https://github.com/mocha-parallel/mocha-parallel-tests/wiki/Limitations) that you can hit when you launch your tests with `mocha-parallel-tests`

## 2.0.2

 * fix: subprocess stderr is not shown if the subprocess crashes before sending the "start" event ([#158](https://github.com/mocha-parallel/mocha-parallel-tests/issues/158))
 * fix: `--retries` and `--bail` option conflict with each other causing `mohcha-parallel-tests` own assertion error ([#163](https://github.com/mocha-parallel/mocha-parallel-tests/issues/163))

## 2.0.1

 * fix: reporter doesn't show anything until all tests are finished ([#145](https://github.com/mocha-parallel/mocha-parallel-tests/issues/145))
 * fix: wrong assertion error when subprocess crashes before sending test results ([#147](https://github.com/mocha-parallel/mocha-parallel-tests/issues/147))
 * fix: `--exit` option was not working as expected ([#146](https://github.com/mocha-parallel/mocha-parallel-tests/issues/146))
 * fix: wrong assertion error when `--retries` option is used and all retries fail ([#143](https://github.com/mocha-parallel/mocha-parallel-tests/issues/143))
 * fix: events order is not following `mocha` style. This fixes `mochawesome` reporter behaviour ([#113](https://github.com/mocha-parallel/mocha-parallel-tests/issues/113))
 * `mocha-allure-reporter` is supported ([#80](https://github.com/mocha-parallel/mocha-parallel-tests/issues/80))

## 2.0.0

v2 is a completely new version of `mocha-parallel-tests` rewritten in TypeScript from scratch. Its main focus is to simplify parallel run of mocha tests: while previously they were executed in one single process **now each file is executed in a separate process**.

Some of the main changes are:

 * **breaking change**: each file is now executed in a separate process
 * **breaking change**: minimum supported node version is 8 because it's current LTS and because of [performance reasons](https://blog.risingstack.com/important-features-fixes-node-js-version-8/)
 * **breaking change**: main exported file should now be imported as `require("mocha-parallel-tests").default` if you're using CommonJS modules
 * **breaking change**: `--retry` is not supported anymore: `mocha-parallel-tests` main target is to be 100%-compliant with `mocha` in terms of API and to not introduce its own options and APIs other than `--max-parallel`
 * **breaking change**: reporter output/stats now contains one more level for each file
 * change: `--max-parallel` option is `os.cpus().length` by default. You can also specify it manually or set it to 0 which means "immediately launch as many processes as the number of files"
 * new: `--delay` option is now supported for each subprocess
 * new: `--retries` option is now supported for each subprocess
 * new: supported peerDependencies versions of `mocha` are not 3, 4 and 5
 * new: all tests are now executed against all supported mocha versions
 * new: `mocha-parallel-tests` install should work fine on windows
 * new: TypeScript definitions are now provided in package.json

Read more about new release here: https://github.com/mocha-parallel/mocha-parallel-tests/wiki/v2-release-notes

## 1.2.10

 * fix: support `--no-timeouts` option ([#120](https://github.com/mocha-parallel/mocha-parallel-tests/issues/120))

## 1.2.9

 * fix: support only latest (3.x) `mocha` versions ([#98](https://github.com/mocha-parallel/mocha-parallel-tests/issues/98))
 * fix: support `reporter.done()` callback for all external reporters (`mochawesome` for example) in both CLI and node.js API ([#113](https://github.com/mocha-parallel/mocha-parallel-tests/issues/113))

## 1.2.8

 * fix: do not fail if no target is set and `--recursive` option is used ([#94](https://github.com/mocha-parallel/mocha-parallel-tests/issues/94))

## 1.2.7

 * fix: add support for `xdescribe`, `xcontext`, `xspecify`, `xit` and `it.skip` ([#102](https://github.com/mocha-parallel/mocha-parallel-tests/issues/102))
 * most of packages dependencies upgrade (minor changes)

## 1.2.6

 * fix: tests with binary dependencies can now be used with `mocha-parallel-tests` ([#100](https://github.com/mocha-parallel/mocha-parallel-tests/issues/100))

## 1.2.5

 * fix: if file contains multiple `describe()` sections in it, one of it fails and `mocha-parallel-tests` is executed with `--retry` option, only this failed section is re-executed ([#77](https://github.com/mocha-parallel/mocha-parallel-tests/issues/77))

## 1.2.4

 * fix: `--no-exit` CLI option is supported ([#85](https://github.com/mocha-parallel/mocha-parallel-tests/issues/85))

## 1.2.3

 * fix: pwd-based reporters (located somewhere inside your repo) are supported ([#75](https://github.com/mocha-parallel/mocha-parallel-tests/issues/75))
 * fix: `tap` and other reporters which use mocha's `runner` object are supported ([#78](https://github.com/mocha-parallel/mocha-parallel-tests/issues/78))
 * fix: `mocha-jenkins-reporter`is supported ([#81](https://github.com/mocha-parallel/mocha-parallel-tests/issues/81))

## 1.2.2

 * fix: `selenium-webdriver` issue with number of tests is fixed ([#69](https://github.com/mocha-parallel/mocha-parallel-tests/issues/69)). Currently all `selenium-webdriver` tests should work as expected.

## 1.2.1

 * fix: `--require`'d files are working as expected together with `--compilers` option ([#63](https://github.com/mocha-parallel/mocha-parallel-tests/issues/63))

## 1.2.0

 * **new**: using mocha-parallel-tests programmatically is now supported. You can also pass own mocha-parallel-tests options by calling `setOwnOptions({maxParallel, retry})` method of mocha-parallel-tests instance. You should call it before `run()`.

## 1.1.x

 * **breaking change**: `mocha` is now in peerDependencies part of `mocha-parallel-tests` which means that you need to add both `mocha` and `mocha-parallel-tests` in your project's package.json. This also means that you can run both of your tests: written for mocha@2.x and mocha@3.x ([#55](https://github.com/mocha-parallel/mocha-parallel-tests/issues/55))
 * fix: support for only() and skip() helpers ([#59](https://github.com/mocha-parallel/mocha-parallel-tests/issues/59))
 * fix: main package file now refers to CommonJS file, not ES6 module.

Version number is 1.1.0 because first `mocha-parallel-tests` releases had 1.0.x versioning scheme.

## 0.5.x

 * **new**: mutiple test suites (describe) inside one file run in parallel
 * fix: support mocha `--compilers` option ([#53](https://github.com/mocha-parallel/mocha-parallel-tests/issues/53)). `0.4.x` lacked support for JavaScript files.
 * fix: support mocha `--require` option
 * fix: support [mocha.opts](https://mochajs.org/#mochaopts) config file ([#44](https://github.com/mocha-parallel/mocha-parallel-tests/issues/44))
 * fix: global hooks stored inside separate files are now executed if target is directory ([#41](https://github.com/mocha-parallel/mocha-parallel-tests/issues/41))
 * fix: global hooks stored inside separate files are now executed ([#39](https://github.com/mocha-parallel/mocha-parallel-tests/issues/39))

## 0.4.x

 * **new**: support for mocha `--compilers` option introduced
 * fix: tests using `--max-parallel=1` run without errors ([#34](https://github.com/mocha-parallel/mocha-parallel-tests/issues/34))
 * fix: reporters with own options like `xunit` don't produce errors now ([#31](https://github.com/mocha-parallel/mocha-parallel-tests/issues/31))
 * fix: `--retry` option is now working for mocha test hooks (before/after/etc)
 * `mocha-parallel-tests` code is now ES2015-compatible

## 0.3.x

 * fix: runner displays right tests execution time now ([#24](https://github.com/mocha-parallel/mocha-parallel-tests/issues/24))
 * fix: exit codes are now the same as in original mocha runner ([#27](https://github.com/mocha-parallel/mocha-parallel-tests/issues/27))
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
