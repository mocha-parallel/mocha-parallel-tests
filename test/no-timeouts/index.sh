#!/bin/bash

dist/bin/mocha-parallel-tests test/no-timeouts/tests #1>/dev/null 2>&1
MPT_STATUS_CODE=$?

dist/bin/mocha-parallel-tests --no-timeouts test/no-timeouts/tests #1>/dev/null 2>&1
MPT_STATUS_CODE_NO_TIMEOUT=$?

# currently mocha exits with 2 if 2 tests failed, 3 if 3 tests failed etc
# though it's a strange behaviour, mocha-parallel-tests behaviour should be the same
if [ $MPT_STATUS_CODE -eq 2 ] && [ $MPT_STATUS_CODE_NO_TIMEOUT -eq 0 ]; then
    echo "Timeouts are ignored if flag is provided"
else
    echo "The flag no-timeouts did not work as expected: $MPT_STATUS_CODE (no flag) instead of 2 and $MPT_STATUS_CODE_NO_TIMEOUT (flag) instead of 0"
    exit 1
fi
