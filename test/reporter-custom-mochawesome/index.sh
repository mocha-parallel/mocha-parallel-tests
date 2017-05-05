#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MOCHAWESOME_REPORT_DIR="mochawesome-report"

# clean directory
rm -fr $DIR/$MOCHAWESOME_REPORT_DIR

OUTPUT=$(cd $DIR && ../../dist/bin/mocha-parallel-tests -R mochawesome $DIR/suite.js)

if [ ! -d "$DIR/$MOCHAWESOME_REPORT_DIR" ]; then
    echo "$MOCHAWESOME_REPORT_DIR directory doesn't exist'"
    exit 1
fi

if [[ $OUTPUT == *"Report HTML saved to"* ]]; then
    exit 0
else
    echo "Reporter output doesn't contain mochawesome HTML file path"
    exit 1
fi
