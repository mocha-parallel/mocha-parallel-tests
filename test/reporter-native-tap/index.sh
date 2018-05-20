#!/bin/bash

OUTPUT=$(dist/bin/cli.js -R tap test/reporter-native-tap/suite.js 2>&1)
STATUS=$?

if [ $STATUS -eq 0 ]; then
    exit 0
else
    echo "Exit code is unexpected: $STATUS"
    echo "Debug output: $OUTPUT"

    exit 1
fi
