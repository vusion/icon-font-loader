const IconFontPlugin = require('../../../index').Plugin;
const webpack = require('webpack');

module.exports = {
    entry: {
        bundle: './index.js',
    },
    output: {
        path: __dirname + '/dest',
        filename: '[name].js',
        publicPath: 'dest/',
    },
    module: {
        rules: [{ test: /\.css$/, use: ['style-loader', 'css-loader', require.resolve('../../../index')] }],
    },
    plugins: [new IconFontPlugin({
        property: 'test',
        startCodepoint: 0xF201,
    })],
};
