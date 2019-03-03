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
    mode: 'development',
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
        new IconFontPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
    ],
};
