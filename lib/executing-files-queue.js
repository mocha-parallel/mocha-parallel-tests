'use strict';

// when test file is taken out of pendingTests queue it's appended into executingFiles queue
// also its status is also saved in form {finished: false, fileName}
// when test execution is over 2 things are executed:
// 1) if this file is first, it is removed from the queue (also next tests are checked)
// 2) otherwise its `finished` status is toggled
// this way we can get currentFile - it is first file in queue
var executingFiles = [];

exports.addFile = function (filePath) {
    executingFiles.push({
        path: filePath,
        finished: false
    });
};

exports.getCurrent = function getCurrent() {
    return executingFiles.length
        ? executingFiles[0].path
        : null;
};

/**
 * Update tasks status and return list of tests
 * which intercepted messages should be released now
 * 
 * @param {String} filePath
 * @return {Array<String>}
 */
exports.taskProcessed = function (filePath) {
    var output = [];

    if (!executingFiles.length) {
        return output;
    }

    if (executingFiles[0].path === filePath) {
        // file that we were searching for is the first in `executingFiles` array
        // now we need to remove it from executingFiles array and loop through array from index 1 to the end
        // 
        // op: loop through array items, while item `finished` property is true
        // add it to output array and remove from `executingFiles` array
        var file = executingFiles.shift();
        output.push(filePath);

        while (executingFiles.length) {
            file = executingFiles[0];

            if (file.finished) {
                file = executingFiles.shift();
                output.push(file.path);
            } else {
                // otherwise file test is still beig executed
                // but there can already be some intercepted messages
                // add this file into output, but do not remove it from `executingFiles` array
                output.push(file.path);
                break;
            }
        }
    } else {
        // first file in `executingFiles` array is not the same as the filePath
        // which means that first file's test is still being processed while
        // test related to `filePath` has finished executing
        // op: find test related to `filePath` and mark it as finished
        for (var i = 1; i < executingFiles.length; i++) {
            if (executingFiles[i].path === filePath) {
                executingFiles[i].finished = true;
                break;
            }
        }
    }

    return output;
};
