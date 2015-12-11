#!/bin/bash
OUTPUT=$(bin/mocha-parallel-tests -R mocha-teamcity-reporter --timeout 60000 --slow 30000 test/reporter/custom-reporter.js 2>&1)
if [[ $OUTPUT == *"##teamcity"* ]]
then
    exit 0;
    else
    exit 1;
fi