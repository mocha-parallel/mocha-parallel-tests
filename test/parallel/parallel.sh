#!/bin/bash

TIMESTAMP_START="$(date +%s)"

OUTPUT=$(dist/bin/cli.js -R spec test/parallel/tests --timeout 10000 --slow 10000)

TIMESTAMP_FINISH="$(date +%s)"
TIMESTAMP_DIFF=`expr $TIMESTAMP_FINISH - $TIMESTAMP_START`
echo "Tests running time was $TIMESTAMP_DIFF seconds"

if [[ $TIMESTAMP_DIFF -lt 10 ]]; then
    exit 0
else
    exit 1
fi
