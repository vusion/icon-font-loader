const IconFontPlugin = require('../../../index').Plugin;
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        bundle: './index.js',
    },
    output: {
        path: __dirname + '/dest',
        filename: '[name].js',
        publicPath: '/dest',
    },
    mode: 'production',
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.css$/,
            use: [{
                loader: MiniCssExtractPlugin.loader,
                options: {
                    publicPath: '../',
                },
            },
            'css-loader',
            require.resolve('../../../index')],
        }],
    },
    plugins: [
        new IconFontPlugin({
            // localCSSTemplate: '',
            localCSSSelector: '.icon',
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
    ],
};
