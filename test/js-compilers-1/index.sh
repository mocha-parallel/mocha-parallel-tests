#!/bin/bash

OUTPUT=$(dist/bin/mocha-parallel-tests --compilers js:test/js-compilers-1/babel-register.js test/js-compilers-1/test.js 2>&1)
STATUS=$?

if [ $STATUS -eq 0 ]; then
    exit 0
else
    echo "Exit code is wrong: $STATUS"
    echo "Output: $OUTPUT"

    exit 1
fi
