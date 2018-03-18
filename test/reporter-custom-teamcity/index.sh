#!/bin/bash

OUTPUT=$(dist/bin/cli.js -R mocha-teamcity-reporter --timeout 60000 --slow 30000 test/reporter-custom-teamcity/suite.js)

if [[ $OUTPUT == *"##teamcity"* ]]; then
    echo "Teamcity reporter is used"
    exit 0
else
    echo "Reporter output doesn't have much common with teamcity: $OUTPUT"
    exit 1
fi
