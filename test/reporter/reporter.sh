#!/bin/bash
OUTPUT=$(bin/mocha-parallel-tests -R json --timeout 60000 --slow 30000 test/reporter/reporter.js 2>&1)
if [[ $OUTPUT == *"stats"* ]]
then
    exit 0;
    else
    exit 1;
fi
