'use strict';

import debug from 'debug';

const debugLog = debug('mocha-parallel-tests:interceptor');
const streams = ['stderr', 'stdout'];
const originalWrites = new Map;

/**
 * Get intersection between arrays
 * 
 * @param {Array} a
 * @param {Array} b
 * @return {Array}
 */
const intersection = (a, b) => {
    const bSet = new Set(b);
    const commonElementsSet = new Set(a.filter(x => bSet.has(x)));

    return [...commonElementsSet];
};

/**
 * Stores messages intercepted from standard streams (stderr, stdout)
 * When `end` event is fired, outputs intercepted data for file
 */
export default class Interceptor {
    constructor() {
        // list of files with tests
        // can't use Set here: there can be multiple suites inside one file
        this._testFiles = [];

        // intercepted messages by file path
        this._messages = new Map;

        this._startIntercepting();
    }

    /**
     * Adds test file to the list of test files being currently executed.
     * When executing process is over, removes it from list
     * 
     * @param {String} filePath
     */
    addTestFile(filePath) {
        this._testFiles.push(filePath);
    }

    /**
     * Hook for emitting all intercepted messages for test file.
     * Should be called after `end` runner event is fired.
     */
    emitEventsByFile(filePath) {
        if (!this._messages.has(filePath)) {
            debugLog(`Warning: no messages found for ${filePath}`);
            return;
        }

        const messages = this._messages.get(filePath);
        for (let {streamName, message} of messages) {
            originalWrites.get(streamName)(message);
        }

        this._messages.delete(filePath); // TODO messages for one file multiple suites

        // remove this file from the list of being currently executed
        // TODO better data structure for that
        this._testFiles.splice(
            this._testFiles.indexOf(filePath),
            1
        );
    }

    /**
     * When runner event is fired reporter can react to this by some actions
     * And usually outputting some information to console
     * 
     * If direct console.log() call is made from test file
     * this file can be detected based on current execution stack.
     * 
     * However if this is a callback from reporter (action to runner event)
     * the execution stack becomes useless. This can be fixed for synchronous
     * callbacks: in this case callback is fired in the same event tick where
     * runner event occurs. Unfortunately this is useless for asynchronous callbacks
     * for example where console.log() call occurs inside async action (setTimeout, fs.writeFile, etc).
     */
    setFileForEventTick(filePath) {
        this._fileForCurrentTick = filePath;

        process.nextTick(() => {
            this._fileForCurrentTick = null;
        });
    }

    /**
     * Restore original standard streams behaviour
     */
    restore() {
        for (let streamName of streams) {
            process[streamName].write = originalWrites.get(streamName);
        }

        originalWrites.clear();
    }

    /**
     * Starts intercepting messages from standard streams
     */
    _startIntercepting() {
        // save stream original functions for further calls
        for (let streamName of streams) {
            const stream = process[streamName];
            originalWrites.set(streamName, stream.write.bind(stream));

            stream.write = (arg) => {
                const currentExecStack = (new Error()).stack;
                const suiteTestFile = this._getTestFileFromStack(currentExecStack) || this._fileForCurrentTick;

                if (suiteTestFile) {
                    const fileMessages = this._messages.get(suiteTestFile) || [];
                    fileMessages.push({
                        streamName,
                        message: arg
                    });

                    this._messages.set(suiteTestFile, fileMessages);
                } else {
                    debugLog('Warning: std stream message fired from unknown location');
                }

                return stream;
            };
        }
    }

    _getTestFileFromStack(execStack) {
        const stackFiles = execStack.split('\n').reduce((stackFiles, chunk) => {
            const matches = chunk.match(/\((.+?):[\d]+:[\d]+\)/);

            if (matches && !stackFiles.includes(matches[1])) {
                stackFiles.push(matches[1]);
            }

            return stackFiles;
        }, []);

        const commonFiles = intersection(stackFiles, this._testFiles);
        return commonFiles.length ? commonFiles[0] : null;
    }
}
