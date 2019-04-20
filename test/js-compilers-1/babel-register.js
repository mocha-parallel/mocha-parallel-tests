'use strict';

require('@babel/register')({
    plugins: [
        ['@babel/plugin-transform-react-jsx', {
            pragma: 'createElement'
        }]
    ]
});
