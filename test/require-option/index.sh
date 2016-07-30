#!/bin/bash

OUTPUT=$(dist/bin/mocha-parallel-tests --require test/require-option/require-module.js test/require-option/test.js)
STATUS=$?

if [ $STATUS -eq 0 ]; then
    exit 0
else
    echo "Exit code is wrong: $STATUS"
    echo "Output: $OUTPUT"

    exit 1
fi
