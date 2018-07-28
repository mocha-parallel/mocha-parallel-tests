#!/bin/bash

PASSES=0
FAILES=0

GREEN='\033[0;32m'
RED='\033[0;31m'
NO_COLOUR='\033[0m'

function test {
    testcase=$1
    testexecutable=$2

    echo -n "${testcase}.. "

    output=`$testexecutable 2>&1`
    status=$?

    if [ $status -ne 0 ]; then
        ((FAILES++))
        echo -e "${RED}FAIL${NO_COLOUR}"
        echo $output
    else
        ((PASSES++))
        echo -e "${GREEN}OK${NO_COLOUR}"
    fi
}

MOCHA_VERSION=`mocha --version`
echo "You're running tests with mocha version $MOCHA_VERSION"

test 'TESTCASE: grep option' test/grep/index.js

echo "Passes: $PASSES Failes: $FAILES"
echo ""

if [ $FAILES -gt 0 ]; then
    exit 1
fi
