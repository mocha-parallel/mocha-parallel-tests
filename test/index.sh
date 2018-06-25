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

function showTestResult {
    if [ $1 -eq 0 ]; then
        echo "OK"
    else
        echo "Failed"
    fi
}

MOCHA_VERSION=`mocha --version`
echo "You're running tests with mocha version $MOCHA_VERSION"
echo ""

echo 'TESTCASE: native (json) reporter'
test test/reporter-native-json/index.sh
showTestResult $?

echo 'TESTCASE: native (tap) reporter'
test test/reporter-native-tap/index.sh
showTestResult $?

echo 'TESTCASE: custom (teamcity) reporter'
test test/reporter-custom-teamcity/index.sh
showTestResult $?

echo 'TESTCASE: custom (jenkins) reporter'
test test/reporter-custom-jenkins/index.sh
showTestResult $?

echo 'TESTCASE: custom (mochawesome) reporter'
test test/reporter-custom-mochawesome/index.sh
showTestResult $?

echo 'TESTCASE: custom (allure) reporter'
test test/reporter-custom-allure/index.sh
showTestResult $?

echo 'TESTCASE: cli target'
test test/cli-target/index.sh
showTestResult $?

echo 'TESTCASE: pwd-based reporter'
test test/reporter-pwd/index.sh
showTestResult $?

echo 'TESTCASE: reporter emits events as soon as they come from subprocess'
test test/reporter-log/index.js
showTestResult $?

echo 'TESTCASE: parallel'
test test/parallel/parallel.sh
showTestResult $?

echo 'TESTCASE: parallel order'
test test/parallel-order/index.js
showTestResult $?

echo 'TESTCASE: max parallel tests'
test test/max-parallel/index.sh
showTestResult $?

echo 'TESTCASE: max parallel equal 1'
test test/max-parallel-1/index.sh
showTestResult $?

echo 'TESTCASE: max parallel tests with empty ones'
test test/max-parallel-empty/index.sh
showTestResult $?

echo 'TESTCASE: only tests run'
test test/only-tests-run/index.js
showTestResult $?

echo 'TESTCASE: nesting'
test test/nesting/nesting.sh
showTestResult $?

echo 'TESTCASE: describe inside describe'
test test/describe-inside-describe/index.js
showTestResult $?

echo 'TESTCASE: missing test'
test test/missing-test/index.js
showTestResult $?

echo 'TESTCASE: console logs'
test test/console-log-inject/index.js
showTestResult $?

echo 'TESTCASE: global hooks'
test test/global-hooks/index.sh
showTestResult $?

echo 'TESTCASE: global hooks with required files'
test test/global-hooks-require/index.sh
showTestResult $?

echo 'TESTCASE: global hooks with directory as a tests source'
test test/global-hooks-directory/index.sh
showTestResult $?

echo 'TESTCASE: --recursive option if no target is set'
test test/recursive-no-target/index.js
showTestResult $?

echo 'TESTCASE: total time'
test test/total-time/index.js
showTestResult $?

echo 'TESTCASE: timeouts exit code'
test test/timeouts-exit-code/index.sh
showTestResult $?

echo 'TESTCASE: no timeouts'
test test/no-timeouts/index.sh
showTestResult $?

echo 'TESTCASE: js compilers support'
test test/js-compilers/index.sh
showTestResult $?

echo 'TESTCASE: js compilers with files support'
test test/js-compilers-1/index.sh
showTestResult $?

echo 'TESTCASE: js compilers with --require support'
test test/js-compilers-2/index.sh
showTestResult $?

echo 'TESTCASE: reporter with options'
test test/reporter-options/index.sh
showTestResult $?

echo 'TESTCASE: mocha.opts'
test test/mocha-opts/index.sh
showTestResult $?

echo 'TESTCASE: syntax errors'
test test/syntax-errors/index.js
showTestResult $?

echo 'TESTCASE: --require option support'
test test/require-option/index.sh
showTestResult $?

echo 'TESTCASE: run programmatically (base API)'
test test/run-programmatically/callback/index.js
showTestResult $?

echo 'TESTCASE: run programmatically (reporter.done is called)'
test test/run-programmatically/reporter-done/index.js
showTestResult $?

echo 'TESTCASE: --no-exit option support'
test test/reporter-end-no-exit/index.js
showTestResult $?

echo 'TESTCASE: node add-on'
test test/node-addon/index.sh
showTestResult $?

echo 'TESTCASE: skip-suite'
test test/skip-suite/index.sh
showTestResult $?

echo 'TESTCASE: skip-test'
test test/skip-test/index.sh
showTestResult $?

echo 'TESTCASE: --delay option support'
test test/delay/index.js
showTestResult $?

echo 'TESTCASE: --retries option support'
test test/retries/index.js
showTestResult $?

echo 'TESTCASE: --exit option support'
test test/exit/index.js
showTestResult $?

echo 'TESTCASE: --retries plus all tests fail'
test test/retries-all-fail/index.js
showTestResult $?

echo 'TESTCASE: --retries and --bail should work well together'
test test/bail-and-retries/index.js
showTestResult $?

echo 'TESTCASE: subprocess exits before sending an end message'
test test/no-subprocess-end/index.js
showTestResult $?

echo 'TESTCASE: unhandled rejections should not force subprocess to exit'
test test/q-promises/index.js
showTestResult $?

echo "Passes: $PASSES Failes: $FAILES"

if [ $FAILES -gt 0 ]; then
    exit 1
fi
