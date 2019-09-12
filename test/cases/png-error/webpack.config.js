const IconFontPlugin = require('../../../index').Plugin;

module.exports = {
    entry: {
        bundle: './index.js',
    },
    output: {
        path: __dirname + '/dest',
        filename: '[name].js',
        publicPath: 'dest/',
    },
    mode: 'production',
    module: {
        rules: [{
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader',
                require.resolve('../../../index'),
            ],
        }],
    },
    plugins: [new IconFontPlugin({
        publicPath: './dest',
    })],
};
