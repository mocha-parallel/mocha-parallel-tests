#!/bin/bash

dist/bin/cli.js -R test/util/silent-reporter.js test/no-timeouts/tests #1>/dev/null 2>&1
MPT_STATUS_CODE=$?

dist/bin/cli.js --no-timeouts -R test/util/silent-reporter.js test/no-timeouts/tests #1>/dev/null 2>&1
MPT_STATUS_CODE_NO_TIMEOUT=$?

# currently mocha exits with 2 if 2 tests failed, 3 if 3 tests failed etc
# though it's a strange behaviour, mocha-parallel-tests behaviour should be the same
if [ $MPT_STATUS_CODE -ne 2 ]; then
  echo "The flag no-timeouts did not work as expected: $MPT_STATUS_CODE (no flag) instead of 2"
  exit 1
fi

if [ $MPT_STATUS_CODE_NO_TIMEOUT -ne 0 ]; then
  echo "The flag no-timeouts did not work as expected: $MPT_STATUS_CODE_NO_TIMEOUT (flag) instead of 0"
  exit 1
fi
