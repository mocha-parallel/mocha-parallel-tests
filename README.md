# Mocha parallel tests runner

[![Build Status](https://img.shields.io/travis/yandex/mocha-parallel-tests/master.svg?style=flat)](https://travis-ci.org/yandex/mocha-parallel-tests)
[![DevDependency Status](http://img.shields.io/david/dev/yandex/mocha-parallel-tests.svg?style=flat)](https://david-dm.org/yandex/mocha-parallel-tests#info=devDependencies)
[![npm version](https://img.shields.io/npm/v/mocha-parallel-tests.svg?style=flat)](https://www.npmjs.com/package/mocha-parallel-tests)


Normally tests written with mocha run sequentially. This happens so because each test suite should not depend on another. But if you are running tests which take a lot of time (for example tests with Selenium Webdriver) waiting for so much time is impossible.

If you're sure that running any of your test suites doesn't affect others, you should try to parallel them with `mocha-parallel-tests`. The only thing that changes for you is that you use not `mocha` but `mocha-parallel-tests` executable because it supports all of mocha options.

Also `mocha-parallel-tests` supports its own `--max-parallel` (max parallel running tests) and `--retry` (number of retries) options.

## Installation

`npm install --save-dev mocha-parallel-tests mocha`

**ATTENTION**: Starting from 1.0.0 `mocha-parallel-tests` adds mocha as a [peerDependency](https://nodejs.org/en/blog/npm/peer-dependencies/) so you should specify what `mocha` version you want to run tests with. Currently 2.3.x, 2.4.x and 3.0.x mocha versions are supported.

## Usage

* `./node_modules/.bin/mocha-parallel-tests your_test_directory/`
* `./node_modules/.bin/mocha-parallel-tests **/*.js`

## Options
Own options:

* `--max-parallel <num>` - max number of running parallel tests
* `--retry <num>` - number of retries (0 by default)

And all options supported by mocha:

* `--reporter <name>` - specify the reporter to use
* `--timeout <n>` - set test-case timeout in milliseconds
* `--slow <n>` - "slow" test threshold in milliseconds

## Differences with `mocha`

 * `--bail` behaviour can differ due to parallel running of tests. See [this issue](https://github.com/yandex/mocha-parallel-tests/issues/88) for more info.

## Tests
`mocha-parallel-tests` is highly covered with tests itself. If you find something bad, feel free to [post an issue](https://github.com/yandex/mocha-parallel-tests/issues/new).
