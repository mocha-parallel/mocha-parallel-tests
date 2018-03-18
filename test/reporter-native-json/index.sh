#!/bin/bash

OUTPUT=$(dist/bin/cli.js -R json --timeout 60000 --slow 30000 test/reporter-native-json/suite.js)

if [[ $OUTPUT == *"stats"* ]]; then
  echo "Native JSON reporter is used"
  exit 0
else
  echo "Reporter output doesn't have much common with JSON: $OUTPUT"
  exit 1
fi
