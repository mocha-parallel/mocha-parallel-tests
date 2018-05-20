#!/bin/bash

OUTPUT=$(dist/bin/cli.js 2>&1)
MPT_STATUS_CODE=$?

node_modules/.bin/mocha 1>/dev/null 2>&1
MOCHA_STATUS_CODE=$?

if [ $MPT_STATUS_CODE -eq $MOCHA_STATUS_CODE ]; then
    if [[ $OUTPUT == *"No test files found"* ]]; then
        exit 0
    else
        echo "Unexpected CLI output: $OUTPUT"
        exit 1
    fi
else
    echo "Exit codes differ: $MPT_STATUS_CODE (actual) vs $MOCHA_STATUS_CODE (expected)"
    exit 1
fi
