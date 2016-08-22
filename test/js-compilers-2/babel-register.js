'use strict';

require('babel-register')({
    plugins: [
        ['transform-react-jsx', {
            pragma: 'createElement'
        }]
    ]
});
