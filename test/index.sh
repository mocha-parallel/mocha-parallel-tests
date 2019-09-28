#!/bin/bash

PASSES=0
FAILES=0

GREEN='\033[0;32m'
RED='\033[0;31m'
NO_COLOUR='\033[0m'

function test {
    testcase=$1
    testexecutable=$2

    echo -n "TESTCASE: ${testcase}.. "

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

test 'native (json) reporter' test/reporter-native-json/index.sh
test 'native (tap) reporter' test/reporter-native-tap/index.sh
test 'custom (teamcity) reporter' test/reporter-custom-teamcity/index.sh
test 'custom (jenkins) reporter' test/reporter-custom-jenkins/index.sh
test 'custom (mochawesome) reporter' test/reporter-custom-mochawesome/index.sh
test 'custom (allure) reporter' test/reporter-custom-allure/index.sh
test 'cli target' test/cli-target/index.sh
test 'pwd-based reporter' test/reporter-pwd/index.sh
test 'reporter emits events as soon as they come from subprocess' test/reporter-log/index.js
test 'parallel' test/parallel/parallel.sh
test 'parallel order' test/parallel-order/index.js
test 'max parallel tests' test/max-parallel/index.sh
test 'max parallel equal 1' test/max-parallel-1/index.sh
test 'max parallel tests with empty ones' test/max-parallel-empty/index.sh
test 'only tests run' test/only-tests-run/index.js
test 'nesting' test/nesting/nesting.sh
test 'describe inside describe' test/describe-inside-describe/index.js
test 'missing test' test/missing-test/index.js
test 'console logs' test/console-log-inject/index.js
test 'global hooks' test/global-hooks/index.sh
test 'global hooks with required files' test/global-hooks-require/index.sh
test 'global hooks with directory as a tests source' test/global-hooks-directory/index.sh
test '--recursive option if no target is set' test/recursive-no-target/index.js
test 'total time' test/total-time/index.js
test 'timeouts exit code' test/timeouts-exit-code/index.sh
test 'no timeouts' test/no-timeouts/index.sh
test 'js compilers support' test/js-compilers/index.sh
test 'js compilers with files support' test/js-compilers-1/index.sh
test 'js compilers with --require support' test/js-compilers-2/index.sh
test 'reporter with options foundation' test/reporter-options/foundation/index.sh
test 'reporter with options CLI flag' test/reporter-options/cli-once/index.js
test 'mocha.opts' test/mocha-opts/index.sh
test 'syntax errors' test/syntax-errors/index.js
test '--require option support' test/require-option/index.sh
test '--file option support' test/file/index.js
test 'run programmatically (base API)' test/run-programmatically/callback/index.js
test 'run programmatically (reporter.done is called)' test/run-programmatically/reporter-done/index.js
test 'run programmatically (worker TTY)' test/run-programmatically/tty-worker/index.js
test '--no-exit option support' test/reporter-end-no-exit/index.js
test 'node native add-on' test/node-native-addon/index.sh
test 'skip-suite' test/skip-suite/index.sh
test 'skip-test' test/skip-test/index.sh
test '--delay option support' test/delay/index.js
test '--retries option support' test/retries/index.js
test '--exit option support' test/exit/index.js
test 'race condition with --exit' test/race-condition-timeout/index.js
test '--retries plus all tests fail' test/retries-all-fail/index.js
test '--retries plus hooks' test/retries-all-fail-2/index.js
test '--retries with test cases defined in a loop' test/retries-all-fail-3/index.js
test '--retries and --bail should work well together' test/bail-and-retries/index.js
test 'subprocess exits before sending an end message' test/no-subprocess-end/index.js
test 'unhandled rejections should not force subprocess to exit' test/q-promises/index.js
test 'uncaught exceptions should not force subprocess to exit' test/uncaught-exception/index.js
test 'grep option' test/grep/index.js
test 'grep option alias support' test/grep/index-alias.js
test 'grep option - programmatic API support' test/grep/indexProgrammatic.js
test '--full-trace option support' test/full-trace/index.js
test 'report with same describe' test/reporter-same-describes/index.js

echo "Passes: $PASSES Failes: $FAILES"
echo ""

if [ $FAILES -gt 0 ]; then
    exit 1
fi
