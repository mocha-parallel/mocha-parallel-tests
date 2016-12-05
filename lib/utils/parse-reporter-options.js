'use strict';

import assert from 'assert';

export default function (reporterOptions) {
    if (!reporterOptions) {
        return;
    }

    const parsedReporterOptions = {};

    for (let option of reporterOptions.split(',')) {
        const elems = option.split('=');
        assert(elems.length === 2 || elems.length === 1, `Invalid reporter option: ${option}`);

        parsedReporterOptions[elems[0]] = (elems.length === 2)
            ? elems[1]
            : true;
    }

    return parsedReporterOptions;
}
