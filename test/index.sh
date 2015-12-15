#!/bin/bash
echo 'TESTCASE: native reporter'
test/reporter-native/index.sh
echo $?
echo 'TESTCASE: custom reporter'
test/reporter-custom/index.sh
echo $?
echo 'TESTCASE: parallel order'
test/parallel-order/index.js
echo $?
echo 'TESTCASE: parallel'
test/parallel/parallel.sh
echo $?
echo 'TESTCASE: only tests run'
test/only-tests-run/index.js
echo $?
echo 'TESTCASE: nesting'
test/nesting/nesting.sh
echo $?
echo 'TESTCASE: describe inside describe'
test/describe-inside-describe/index.js
echo $?
