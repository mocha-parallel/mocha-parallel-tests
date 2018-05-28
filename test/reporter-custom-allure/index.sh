#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPORT_DIR="allure-results"

# clean directory
rm -fr $DIR/$REPORT_DIR
cd $DIR && ../../dist/bin/cli.js -R mocha-allure-reporter $DIR/suite.js

if [ ! -d "$DIR/$REPORT_DIR" ]; then
    echo "$REPORT_DIR directory doesn't exist"
    exit 1
fi

if [ -z "$(ls -A $DIR/$REPORT_DIR)" ]; then
    echo "$REPORT_DIR directory is empty"
    exit 1
fi
