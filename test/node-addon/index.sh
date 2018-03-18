#!/bin/bash

OUTPUT=$(npm install test/node-addon/test_addon 2>&1 && dist/bin/cli.js test/node-addon/test.js 2>&1)
STATUS=$?

if [ $STATUS -eq 0 ]; then
    exit 0
else
    echo "Exit code is wrong: $STATUS"
    echo "Output: $OUTPUT"

    exit 1
fi
