#!/bin/bash

OUTPUT=$(USE_CHILD_PROCESS=1 dist/bin/cli.js test/use-child-process-var/tests)
STATUS=$?

if [ $STATUS -eq 0 ]; then
    exit 0
else
    echo "Exit code is wrong: $STATUS"
    echo "Output: $OUTPUT"

    exit 1
fi

