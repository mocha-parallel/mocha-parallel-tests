#!/bin/bash
T="$(date +%s)"
bin/mocha-parallel-tests -R spec --timeout 60000 --slow 30000 test/parallel/tests
T="$(($(date +%s)-T))"
if [[ $T -lt 30 ]]
then
    exit 0;
    else
    exit 1;
fi