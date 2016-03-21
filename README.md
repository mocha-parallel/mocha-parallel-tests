# Mocha parallel tests runner

[![Build Status](https://img.shields.io/travis/mmotkina/mocha-parallel-tests.svg?style=flat)](https://travis-ci.org/mmotkina/mocha-parallel-tests)
[![DevDependency Status](http://img.shields.io/david/dev/mmotkina/mocha-parallel-tests.svg?style=flat)](https://david-dm.org/mmotkina/mocha-parallel-tests#info=devDependencies)

Normally tests written with mocha run sequentially. This happens so because each test suite should not depend on another. But if you are running tests which take a lot of time (for example tests with Selenium Webdriver) waiting for so much time is impossible.

If you're sure that running any of your test suites doesn't affect others, you should try to parallel them with `mocha-parallel-tests`. The only thing that changes for you is that you use not `mocha` but `mocha-parallel-tests` executable because it supports all of mocha options.

## Installation

`npm install --save mocha-parallel-tests`

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

## Tests
`mocha-parallel-tests` is highly covered with tests itself. If you find something bad, feel free to [post an issue](https://github.com/mmotkina/mocha-parallel-tests/issues/new).
