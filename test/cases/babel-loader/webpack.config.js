const IconFontPlugin = require('../../../index').Plugin;
const webpack = require('webpack');
const path = require('path');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
    entry: {
        bundle: './index.js',
    },
    output: {
        path: __dirname + '/dest',
        filename: '[name].js',
        publicPath: '/',
    },
    // mode: 'development',
    module: {
        rules: [
        {
            test: /\.js$/,
            use: [
                'babel-loader',
            ],
            // exclude: path.resolve('../../../src'),
        },{
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader',
                require.resolve('../../../index'),
            ],
        }],
    },
    plugins: [new IconFontPlugin({
        publicPath: '/',
    })],
};
