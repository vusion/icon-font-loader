const IconFontPlugin = require('../../../index').Plugin;

module.exports = {
    entry: {
        bundle: './index.js',
    },
    devtool: 'eval',
    output: {
        path: __dirname + '/dest',
        filename: '[name].js',
        publicPath: 'dest/',
    },
    // mode: 'development',
    module: {
        rules: [{
            test: /\.scss$/,
            use: [{
                loader: require.resolve('style-loader'),
                options: {
                    sourceMap: true,
                },
            }, {
                loader: require.resolve('css-loader'),
                options: {
                    sourceMap: true,
                }
            },
            require.resolve('../../../index'),
            {
                loader: require.resolve('sass-loader'),
                options: {
                    sourceMap: true,
                }
            }],
        }],
    },
    plugins: [new IconFontPlugin()],
};
