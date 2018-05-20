#!/bin/bash

TIMESTAMP_START="$(date +%s)"

OUTPUT=$(dist/bin/cli.js -R spec test/mocha-opts/tests --slow 10000 --opts test/mocha-opts/mocha.opts)
STATUS=$?
TIMESTAMP_FINISH="$(date +%s)"
TIMESTAMP_DIFF=`expr $TIMESTAMP_FINISH - $TIMESTAMP_START`

if [ $STATUS -eq 0 ]; then
    if [[ $TIMESTAMP_DIFF -lt 10 ]]; then
        exit 0
    else
        echo "Running time is too big: $TIMESTAMP_DIFF"
        exit 1
    fi
else
    echo "Exit code is wrong: $STATUS"
    exit 1
fi
