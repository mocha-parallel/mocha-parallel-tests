#!/bin/bash

dist/bin/mocha-parallel-tests --timeout 3000 --slow 30000 test/timeouts-exit-code/suite.js 1>/dev/null 2>&1
MPT_STATUS_CODE=$?

node_modules/.bin/mocha --timeout 3000 --slow 30000 test/timeouts-exit-code/suite.js 1>/dev/null 2>&1
MOCHA_STATUS_CODE=$?

# currently mocha exits with 2 if 2 tests failed, 3 if 3 tests failed etc
# though it's a strange behaviour, mocha-parallel-tests behaviour should be the same
if [ $MPT_STATUS_CODE -eq $MOCHA_STATUS_CODE ]; then
    echo "Timeout status code is the same as in mocha"
else
    echo "Timeout status code is not valid: $MPT_STATUS_CODE (actual) vs $MOCHA_STATUS_CODE (expected)"
    exit 1
fi
