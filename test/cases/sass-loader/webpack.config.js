const IconFontPlugin = require('../../../index').Plugin;
const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
    entry: {
        bundle: './index.js',
    },
    devtool: 'eval',
    output: {
        path: __dirname + '/dest',
        filename: '[name].js',
        publicPath: '/',
    },
    // mode: 'development',
    module: {
        rules: [{
            test: /\.scss$/,
            use: [
                {
                    loader: require.resolve("style-loader"),
                    options: {
                        sourceMap: true,
                    },
                },
                {
                    loader: require.resolve("css-loader"),
                    options: {
                        sourceMap: true,
                    }
                },
                require.resolve('../../../index'),
                {
                    loader: require.resolve("sass-loader"),
                    options: {
                        sourceMap: true,
                    }
                }
            ],
        }],
    },
    plugins: [new IconFontPlugin({
        publicPath: '/',
    })],
};
