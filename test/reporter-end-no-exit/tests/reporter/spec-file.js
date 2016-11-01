'use strict';

const os = require('os');
const fs = require('fs');

const Base = require('mocha').reporters.base;
const inherits = require('mocha').utils.inherits;

const FILE_PATH = `${os.tmpdir()}/${process.env.FILE}`;

function extraSpec(runner) {
    Base.call(this, runner);

    runner.on('end', () => {
        // write file to temp directory
        fs.writeFile(FILE_PATH, 'test', err => {
            if (err) {
                throw new Error(`expected ${FILE_PATH} file write`);
            }
        });
    });
}

module.exports = extraSpec;

inherits(extraSpec, Base);
