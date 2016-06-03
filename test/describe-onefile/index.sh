#!/bin/bash

TIMESTAMP_START="$(date +%s)"
OUTPUT=$(dist/bin/mocha-parallel-tests test/describe-onefile/test.js --slow 3000 --timeout 3000 2>&1)
STATUS=$?
TIMESTAMP_FINISH="$(date +%s)"
TIMESTAMP_DIFF=`expr $TIMESTAMP_FINISH - $TIMESTAMP_START`
echo "Tests running time was $TIMESTAMP_DIFF second(s)"

if [ $TIMESTAMP_DIFF -ge 1 ] && [ $TIMESTAMP_DIFF -le 3 ]; then
    if [ $STATUS -ne 0 ]; then
        if [[ $OUTPUT == *"2 passing"* ]] && [[ $OUTPUT == *"1 failing"* ]]; then
            exit 0
        else
            echo "Wrong output: $OUTPUT"
            exit 1
        fi
    else
        echo "Result code is wrong (should not be 0)"
        exit 1
    fi
else
    echo "Wrong tests execution time"
    exit 1
fi
