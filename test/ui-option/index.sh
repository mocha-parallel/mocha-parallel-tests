#!/bin/bash

OUTPUT=$(../../dist/bin/cli.js --ui tdd)
STATUS=$?

if [ $STATUS -eq 0 ]; then
    exit 0
else
    echo "Exit code is wrong: $STATUS"
    echo "Output: $OUTPUT"

    exit 1
fi
