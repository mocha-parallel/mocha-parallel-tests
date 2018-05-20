#!/bin/bash

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
OUTPUT=$(cd ${CURRENT_DIR} && ../../dist/bin/cli.js -R reporter-pwd suite.js)

if [[ $OUTPUT == *"startfinish"* ]]; then
    exit 0
else
    echo "PWD-based reporter is not supported. OUTPUT: $OUTPUT"
    exit 1
fi
