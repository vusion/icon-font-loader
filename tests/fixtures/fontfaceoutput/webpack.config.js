const IconFontPlugin = require('../../../index').Plugin;
const ExtractTextPlugin = require('extract-text-webpack-plugin');


// extraire le CSS présent dans le JS
let extractCSS = new ExtractTextPlugin(
    {
        filename: './result.css',
        allChunks: true
    }
);

module.exports = {
    entry: {
        bundle: './index.js',
    },
    output: {
        path: __dirname + '/dest',
        filename: '[name].js',
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: extractCSS.extract({
                fallback: 'style-loader',
                use: [
                    'css-loader',
                    require.resolve('../../../index')
                ]
            })
        }],
    },
    plugins: [
        extractCSS,
        new IconFontPlugin({
            fontFaceOutput: false
        })
    ],
};
