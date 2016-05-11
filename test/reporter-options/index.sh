#!/bin/bash

OUTPUT=$(dist/bin/mocha-parallel-tests -R xunit test/reporter-options/suite.js 2>&1)
STATUS=$?

if [ $STATUS -eq 0 ]; then
    exit 0
else
    echo "Exit code is $STATUS"
    echo "Output: $OUTPUT"

    exit 1
fi
