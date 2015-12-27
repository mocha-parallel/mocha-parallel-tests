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
echo 'TESTCASE: only tests run'
test test/only-tests-run/index.js
echo $?
echo 'TESTCASE: nesting'
test test/nesting/nesting.sh
echo $?
echo 'TESTCASE: describe inside describe'
test test/describe-inside-describe/index.js
echo $?

echo "Passes: $PASSES Failes: $FAILES"
