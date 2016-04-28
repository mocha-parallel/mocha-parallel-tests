#!/bin/bash

OUTPUT=$(dist/bin/mocha-parallel-tests --compilers js:babel-register test/js-compilers/test.js 2>&1)
STATUS=$?

if [ $STATUS -neq 0 ]; then
    echo "Exit code is $STATUS"
    echo "Output: $OUTPUT"

    exit 1
fi
