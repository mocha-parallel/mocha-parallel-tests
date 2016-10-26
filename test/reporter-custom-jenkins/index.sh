#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
RESULT="$DIR/result.xml"
OUTPUT=$(JUNIT_REPORT_PATH=$RESULT dist/bin/mocha-parallel-tests -R mocha-jenkins-reporter test/reporter-custom-jenkins/suite.js 2>&1)
STATUS=$?

if [ $STATUS -eq 0 ]; then
    RESULT_XML=$(cat $RESULT)

    if [[ $RESULT_XML == *"<testsuites "* ]] && [[ $RESULT_XML == *"<testsuite "* ]] && [[ $RESULT_XML == *"<testcase "* ]]; then
        EXIT_CODE=0
    else
        echo "Reporter output file is wrong: $RESULT_XML"
        EXIT_CODE=1
    fi
else
    echo "Exit code is unexpected: $STATUS"
    echo "Debug output: $OUTPUT"

    EXIT_CODE=1
fi

rm $RESULT
exit $EXIT_CODE
