#!/bin/bash
OUTPUT=$(bin/mocha-parallel-tests -R spec --timeout 60000 --slow 30000 test/nesting/nesting.js)
strindex() { 
  x="${1%%$2*}"
  [[ $x = $1 ]] && echo -1 || echo ${#x}
}
PARENT=$(strindex "$OUTPUT" "parent")
CHILD=$(strindex "$OUTPUT" "child")
echo "${PARENT}"
echo "${CHILD}"
if [[ PARENT -lt CHILD ]]
then
    exit 0;
    else
    exit 1;
fi