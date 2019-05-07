const IconFontPlugin = require('../../../index').Plugin;

module.exports = {
    entry: {
        bundle: './index.js',
    },
    mode: 'development',
    output: {
        path: __dirname + '/dest',
        filename: '[name].js',
        publicPath: 'dest/',
    },
    devtool: 'source-map',
    module: {
        rules: [{ test: /\.css$/, use: ['style-loader', 'css-loader', require.resolve('../../../index')] }],
    },
    plugins: [new IconFontPlugin()],
};
