const IconFontPlugin = require('../../../index').Plugin;

module.exports = {
    entry: {
        'bundle.2': './index.2.js',
    },
    output: {
        path: __dirname + '/dest',
        filename: '[name].js',
        publicPath: 'dest/',
    },
    module: {
        rules: [{ test: /\.css$/, use: ['style-loader', 'css-loader', require.resolve('../../../index')] }],
    },
    plugins: [new IconFontPlugin({
        fontName: 'icon-font-2',
        fontOptions: {
            fontWeight: 1000,
            // fixedWidth: true,
            fontHeight: 1000,
            normalize: true,
        },
    })],
};
