const IconFontPlugin = require('../../../index').Plugin;
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        bundle: './index.js',
    },
    output: {
        path: __dirname + '/dest',
        filename: '[name].[hash].js',
        publicPath: '/',
    },
    mode: 'development',
    module: {
        rules: [{
            test: /\.css$/,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        publicPath: '../',
                    },
                },
                'css-loader',
                require.resolve('../../../index'),
            ],
        }],
    },
    plugins: [new IconFontPlugin({
        publicPath: './dest',
    }), new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css',
    })],
};
