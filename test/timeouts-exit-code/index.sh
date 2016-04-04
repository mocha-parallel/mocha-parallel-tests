#!/bin/bash

bin/mocha-parallel-tests --timeout 3000 --slow 30000 test/timeouts-exit-code/suite.js 1>/dev/null 2>&1
STATUS_CODE=$?

if [ $STATUS_CODE -eq 1 ]; then
    echo "Timeout status code is 1 as expected"
else
    echo "Timeout status code is not valid: $STATUS_CODE"
    exit 1
fi
