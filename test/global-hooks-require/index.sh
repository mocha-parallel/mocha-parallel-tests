#!/bin/bash

OUTPUT=$(dist/bin/mocha-parallel-tests test/global-hooks-require/test.js 2>&1)
STATUS=$?

if [ $STATUS -eq 2 ]; then
    if [[ $OUTPUT == *"run global before hook"* ]] && [[ $OUTPUT == *"run global after hook"* ]]; then
        exit 0
    else
        echo "Output doesn't contain information about running hooks"
        echo "Output: $OUTPUT"

        exit 1
    fi
else
    echo "Exit code is wrong: $STATUS"
    exit 1
fi
