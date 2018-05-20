#!/bin/bash

TESTDIR="test/js-compilers-2"
OUTPUT=$(dist/bin/cli.js --compilers js:${TESTDIR}/babel-register.js --require ${TESTDIR}/setup.js ${TESTDIR}/test.js 2>&1)
STATUS=$?

if [ $STATUS -eq 0 ]; then
    exit 0
else
    echo "Exit code is wrong: $STATUS"
    echo "Output: $OUTPUT"

    exit 1
fi
