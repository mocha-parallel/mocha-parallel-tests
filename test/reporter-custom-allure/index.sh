#!/bin/bash

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TARGET_DIR="$CURRENT_DIR/mpt-allure-results"
dist/bin/mocha-parallel-tests -R mocha-allure-reporter test/reporter-custom-allure/suite.js --reporter-options targetDir=$TARGET_DIR 2>&1
STATUS=$?
ALLURE_REPORT=`find $TARGET_DIR -type f -name '*-testsuite.xml' -exec cat {} \;`

if [ $STATUS -eq 0 ]; then
    EXIT_CODE=0
else
    echo "Exit code is unexpected: $STATUS"
    echo "Debug output: $OUTPUT"
    echo "Allure report: $ALLURE_REPORT"

    EXIT_CODE=1
fi

exit $EXIT_CODE
