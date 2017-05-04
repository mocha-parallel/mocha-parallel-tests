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

echo 'TESTCASE: native (json) reporter'
test test/reporter-native-json/index.sh
echo $?
echo 'TESTCASE: native (tap) reporter'
test test/reporter-native-tap/index.sh
echo $?
echo 'TESTCASE: custom (teamcity) reporter'
test test/reporter-custom-teamcity/index.sh
echo $?
echo 'TESTCASE: custom (jenkins) reporter'
test test/reporter-custom-jenkins/index.sh
echo $?
echo 'TESTCASE: custom (mochawesome) reporter'
test test/reporter-custom-mochawesome/index.sh
echo $?
echo 'TESTCASE: cli targets'
test test/cli-target/index.sh
echo $?
echo 'TESTCASE: pwd-based reporter'
test test/reporter-pwd/index.sh
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
echo 'TESTCASE: multiple suites in one file, one fails'
test test/describe-onefile-fail/index.js
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
echo 'TESTCASE: --recursive option if no target is set'
test test/recursive-no-target/index.js
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
echo 'TESTCASE: js compilers with files support'
test test/js-compilers-1/index.sh
echo $?
echo 'TESTCASE: js compilers with --require support'
test test/js-compilers-2/index.sh
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
echo 'TESTCASE: syntax errors'
test test/syntax-errors/index.js
echo $?
echo 'TESTCASE: --require option support'
test test/require-option/index.sh
echo $?
echo 'TESTCASE: run programmatically'
test test/run-programmatically/index.js
echo $?
echo 'TESTCASE: --no-exit option support'
test test/reporter-end-no-exit/index.js
echo $?
echo 'TESTCASE: node add-on'
test test/node-addon/index.sh
echo $?
echo 'TESTCASE: skip-suite'
test test/skip-suite/index.sh
echo $?
echo 'TESTCASE: skip-test'
test test/skip-test/index.sh
echo $?

if [ $SAUCE_USERNAME ] && [ $SAUCE_ACCESS_KEY ]; then
    echo 'TESTCASE: selenium-webdriver'
    test test/selenium-webdriver/index.js
    echo $?

    echo 'TESTCASE: selenium-webdriver failing tests'
    test test/selenium-webdriver-1/index.js
    echo $?

    echo 'TESTCASE: selenium-webdriver tests duration'
    test test/selenium-webdriver-2/index.js
    echo $?
else
    echo "Please set SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables to run selenium-webdriver tests"
fi

echo "Passes: $PASSES Failes: $FAILES"

if [ $FAILES -gt 0 ]; then
    exit 1
fi
