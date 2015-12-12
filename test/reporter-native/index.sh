#!/bin/bash

OUTPUT=$(bin/mocha-parallel-tests -R json --timeout 60000 --slow 30000 test/reporter-native/suite.js 2>&1)

if [[ $OUTPUT == *"stats"* ]]; then
    echo "Native JSON reporter is used"
    exit 0
else
    echo "Reporter output doesn't have much common with JSON: $OUTPUT"
    exit 1
fi
