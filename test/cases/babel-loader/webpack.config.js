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
    // mode: 'development',
    module: {
        rules: [{
            test: /\.js$/,
            use: [
                'babel-loader',
            ],
            // exclude: path.resolve('../../../src'),
        }, {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader',
                require.resolve('../../../index'),
            ],
        }],
    },
    plugins: [new IconFontPlugin()],
};
