#!/bin/bash
PASSES=0
FAILES=0

function test {
    "$@"
    local status=$?
    if [ $status -ne 0 ]; then
        ((FAILES++))
        else
        ((PASSES++))
    fi
    return $status
}

echo 'TESTCASE: native reporter'
test test/reporter-native/index.sh
echo $?
echo 'TESTCASE: custom reporter'
test test/reporter-custom/index.sh
echo $?
echo 'TESTCASE: parallel'
test test/parallel/parallel.sh
echo $?
echo 'TESTCASE: parallel order'
test test/parallel-order/index.js
echo $?
echo 'TESTCASE: max parallel tests'
test test/max-parallel/index.sh
echo $?
echo 'TESTCASE: max parallel equal 1'
test test/max-parallel-1/index.sh
echo $?
echo 'TESTCASE: max parallel tests with empty ones'
test test/max-parallel-empty/index.sh
echo $?
echo 'TESTCASE: only tests run'
test test/only-tests-run/index.js
echo $?
echo 'TESTCASE: nesting'
test test/nesting/nesting.sh
echo $?
echo 'TESTCASE: describe inside describe'
test test/describe-inside-describe/index.js
echo $?
echo 'TESTCASE: multiple suites in one file'
test test/describe-onefile/index.sh
echo $?
echo 'TESTCASE: missing test'
test test/missing-test/index.js
echo $?
echo 'TESTCASE: console logs'
test test/console-log-inject/index.js
echo $?
echo 'TESTCASE: global hooks'
test test/global-hooks/index.sh
echo $?
echo 'TESTCASE: global hooks with required files'
test test/global-hooks-require/index.sh
echo $?
echo 'TESTCASE: global hooks with directory as a tests source'
test test/global-hooks-directory/index.sh
echo $?
echo 'TESTCASE: retries'
test test/retry/index.js
echo $?
echo 'TESTCASE: retries debug messages'
test test/retry-errors/index.js
echo $?
echo 'TESTCASE: total time'
test test/total-time/index.js
echo $?
echo 'TESTCASE: timeouts exit code'
test test/timeouts-exit-code/index.sh
echo $?
echo 'TESTCASE: js compilers support'
test test/js-compilers/index.sh
echo $?
echo 'TESTCASE: retry support in mocha hooks'
test test/retry-before/index.sh
echo $?
echo 'TESTCASE: reporter with options'
test test/reporter-options/index.sh
echo $?
echo 'TESTCASE: mocha.opts'
test test/mocha-opts/index.sh
echo $?
echo 'TESTCASE: --require option support'
test test/require-option/index.js
echo $?

echo "Passes: $PASSES Failes: $FAILES"

if [ $FAILES -gt 0 ]; then
    exit 1
fi
