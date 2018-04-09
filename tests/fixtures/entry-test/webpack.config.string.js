const IconFontPlugin = require('../../../index').Plugin;
const webpack = require('webpack');

module.exports = {
    entry: './index.js',
    output: {
        path: __dirname + '/dest',
        filename: '[name].[hash].js',
        publicPath:"/"
    },
    module: {
        rules: [{ test: /\.css$/, use: ['style-loader', 'css-loader', require.resolve('../../../index')] }],
    },
    plugins: [new IconFontPlugin()],
};
