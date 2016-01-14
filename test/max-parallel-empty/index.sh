#!/bin/bash

TIMESTAMP_START="$(date +%s)"

OUTPUT=$(bin/mocha-parallel-tests -R spec test/max-parallel-empty/tests --timeout 30000 --slow 10000 --max-parallel 3)

# parallel1.js ends in 1 second, parallel2.js in 2 seconds etc
# when any test is over, next should start
# the problem is: mocha doesn't know how much time is needed for test to execute
# expectations: tests will run less than two max times (5 + 4) + 1 second for flaky tests
# expectations: tests will run more than max test time (5 seconds) + 1 second for flaky tests

TIMESTAMP_FINISH="$(date +%s)"
TIMESTAMP_DIFF=`expr $TIMESTAMP_FINISH - $TIMESTAMP_START`

echo "Tests output is $OUTPUT"
echo "Tests running time was $TIMESTAMP_DIFF seconds"

if [ $TIMESTAMP_DIFF -gt 3 ] && [ $TIMESTAMP_DIFF -lt 4 ] && [[ $OUTPUT == *"1 passing"* ]]; then
    exit 0
else
    exit 1
fi
