#!/bin/bash

TIMESTAMP_START="$(date +%s)"
OUTPUT=$(dist/bin/cli.js -R spec test/max-parallel-1/tests --timeout 30000 --slow 10000 --max-parallel 1)
TIMESTAMP_FINISH="$(date +%s)"
TIMESTAMP_DIFF=`expr $TIMESTAMP_FINISH - $TIMESTAMP_START`

if [ $TIMESTAMP_DIFF -ge 6 ]; then
    if [[ $OUTPUT == *"3 passing"* ]]; then
        exit 0
    else
        echo "Not all tests launched"
        exit 1
    fi
else
    echo "Wrong tests execution time: $TIMESTAMP_DIFF second(s)"
    exit 1
fi
