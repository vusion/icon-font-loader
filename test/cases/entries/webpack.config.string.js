const IconFontPlugin = require('../../../index').Plugin;
const webpack = require('webpack');

module.exports = {
    entry: './index.js',
    output: {
        path: __dirname + '/dest',
        filename: '[name].js',
        publicPath: '/',
    },
    mode: 'development',
    module: {
        rules: [{ test: /\.css$/, use: ['style-loader', 'css-loader', require.resolve('../../../index')] }],
    },
    plugins: [new IconFontPlugin()],
};
