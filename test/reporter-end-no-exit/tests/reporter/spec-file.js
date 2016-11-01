'use strict';

const Base = require('mocha').reporters.base;
const inherits = require('mocha').utils.inherits;
const fs = require('fs');

const FILE_PATH = `${process.env.TMPDIR}${process.env.FILE}`;

function extraSpec(runner) {
    Base.call(this, runner);
    const that = this;

    runner.on('suite', suite => {
        console.log(suite.title);
    });

    runner.on('pass', test => {
        console.log(test.title);
    });

    runner.on('end', () => {
        // write file to temp directory
        fs.writeFile(FILE_PATH, 'writed', err => {
            if (err) {
                throw new Error(`expected ${FILE_PATH} file write`);
            }
        });

        that.epilogue();
    });

}

module.exports = extraSpec;

inherits(extraSpec, Base);
