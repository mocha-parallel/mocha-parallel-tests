#!/bin/bash

OUTPUT=$(bin/mocha-parallel-tests -R mocha-teamcity-reporter --timeout 60000 --slow 30000 test/reporter-custom/suite.js 2>&1)

if [[ $OUTPUT == *"##teamcity"* ]]; then
    echo "Teamcity reporter is used"
    exit 0
else
    echo "Reporter output doesn't have much common with teamcity: $OUTPUT"
    exit 1
fi
