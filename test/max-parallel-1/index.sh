#!/bin/bash

TIMESTAMP_START="$(date +%s)"
OUTPUT=$(dist/bin/mocha-parallel-tests -R spec test/max-parallel-1/tests --timeout 30000 --slow 10000 --max-parallel 1)
TIMESTAMP_FINISH="$(date +%s)"
TIMESTAMP_DIFF=`expr $TIMESTAMP_FINISH - $TIMESTAMP_START`
echo "Tests running time was $TIMESTAMP_DIFF second(s)"

if [ $TIMESTAMP_DIFF -gt 3 ] && [ $TIMESTAMP_DIFF -lt 4 ]; then
    if [[ $OUTPUT == *"3 passing"* ]]; then
        exit 0
    else
        echo "Not all tests launched"
        exit 1
    fi
else
    echo "Wrong tests execution time"
    exit 1
fi
