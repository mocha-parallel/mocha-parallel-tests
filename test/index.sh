#!/bin/bash

PASSES=0
FAILES=0

GREEN='\033[0;32m'
RED='\033[0;31m'
NO_COLOUR='\033[0m'

function test {
    testcase=$1
    testexecutable=$2

    echo -n "${testcase}.. "

    output=`$testexecutable 2>&1`
    status=$?

    if [ $status -ne 0 ]; then
        ((FAILES++))
        echo -e "${RED}FAIL${NO_COLOUR}"
        echo $output
    else
        ((PASSES++))
        echo -e "${GREEN}OK${NO_COLOUR}"
    fi
}

MOCHA_VERSION=`mocha --version`
echo "You're running tests with mocha version $MOCHA_VERSION"

test 'TESTCASE: native (json) reporter' test/reporter-native-json/index.sh
test 'TESTCASE: native (tap) reporter' test/reporter-native-tap/index.sh
test 'TESTCASE: custom (teamcity) reporter' test/reporter-custom-teamcity/index.sh
test 'TESTCASE: custom (jenkins) reporter' test/reporter-custom-jenkins/index.sh
test 'TESTCASE: custom (mochawesome) reporter' test/reporter-custom-mochawesome/index.sh
test 'TESTCASE: custom (allure) reporter' test/reporter-custom-allure/index.sh
test 'TESTCASE: cli target' test/cli-target/index.sh
test 'TESTCASE: pwd-based reporter' test/reporter-pwd/index.sh
test 'TESTCASE: reporter emits events as soon as they come from subprocess' test/reporter-log/index.js
test 'TESTCASE: parallel' test/parallel/parallel.sh
test 'TESTCASE: parallel order' test/parallel-order/index.js
test 'TESTCASE: max parallel tests' test/max-parallel/index.sh
test 'TESTCASE: max parallel equal 1' test/max-parallel-1/index.sh
test 'TESTCASE: max parallel tests with empty ones' test/max-parallel-empty/index.sh
test 'TESTCASE: only tests run' test/only-tests-run/index.js
test 'TESTCASE: nesting' test/nesting/nesting.sh
test 'TESTCASE: describe inside describe' test/describe-inside-describe/index.js
test 'TESTCASE: missing test' test/missing-test/index.js
test 'TESTCASE: console logs' test/console-log-inject/index.js
test 'TESTCASE: global hooks' test/global-hooks/index.sh
test 'TESTCASE: global hooks with required files' test/global-hooks-require/index.sh
test 'TESTCASE: global hooks with directory as a tests source' test/global-hooks-directory/index.sh
test 'TESTCASE: --recursive option if no target is set' test/recursive-no-target/index.js
test 'TESTCASE: total time' test/total-time/index.js
test 'TESTCASE: timeouts exit code' test/timeouts-exit-code/index.sh
test 'TESTCASE: no timeouts' test/no-timeouts/index.sh
test 'TESTCASE: js compilers support' test/js-compilers/index.sh
test 'TESTCASE: js compilers with files support' test/js-compilers-1/index.sh
test 'TESTCASE: js compilers with --require support' test/js-compilers-2/index.sh
test 'TESTCASE: reporter with options' test/reporter-options/index.sh
test 'TESTCASE: mocha.opts' test/mocha-opts/index.sh
test 'TESTCASE: syntax errors' test/syntax-errors/index.js
test 'TESTCASE: --require option support' test/require-option/index.sh
test 'TESTCASE: run programmatically (base API)' test/run-programmatically/callback/index.js
test 'TESTCASE: run programmatically (reporter.done is called)' test/run-programmatically/reporter-done/index.js
test 'TESTCASE: --no-exit option support' test/reporter-end-no-exit/index.js
test 'TESTCASE: node add-on' test/node-addon/index.sh
test 'TESTCASE: skip-suite' test/skip-suite/index.sh
test 'TESTCASE: skip-test' test/skip-test/index.sh
test 'TESTCASE: --delay option support' test/delay/index.js
test 'TESTCASE: --retries option support' test/retries/index.js
test 'TESTCASE: --exit option support' test/exit/index.js
test 'TESTCASE: --retries plus all tests fail' test/retries-all-fail/index.js
test 'TESTCASE: --retries and --bail should work well together' test/bail-and-retries/index.js
test 'TESTCASE: subprocess exits before sending an end message' test/no-subprocess-end/index.js
test 'TESTCASE: unhandled rejections should not force subprocess to exit' test/q-promises/index.js
test 'TESTCASE: uncaught exceptions should not force subprocess to exit' test/uncaught-exception/index.js

echo "Passes: $PASSES Failes: $FAILES"
echo ""

if [ $FAILES -gt 0 ]; then
    exit 1
fi
