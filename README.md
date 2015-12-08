Run mocha test suits in parallel

## Installation

npm install --save mocha-parallel-tests

## Usage

mocha-parallel-tests your_test_directory/*
mocha-parallel-tests **/*.js

## Options

--reporter <name> specify the reporter to use
--timeout <n> set test-case timeout in milliseconds
--slow <n> "slow" test threshold in milliseconds


## Example
* `make test` - runs with default reporter
* `make test --timeout 60000 --slow 30000 test/test` - runs with options
