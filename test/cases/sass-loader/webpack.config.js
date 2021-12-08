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
    mode: 'development',
    devtool: 'eval',
    module: {
        rules: [{
            test: /\.css$/,
            use: [{
                loader: require.resolve('style-loader'),
            }, {
                loader: require.resolve('css-loader'),
                options: {
                    sourceMap: true,
                },
            }],
        }, {
            test: /\.scss$/,
            use: [{
                loader: require.resolve('style-loader'),
            }, {
                loader: require.resolve('css-loader'),
                options: {
                    sourceMap: true,
                },
            },
            require.resolve('../../../index'),
            {
                loader: require.resolve('sass-loader'),
                options: {
                    sourceMap: true,
                },
            }],
        }],
    },
    plugins: [new IconFontPlugin()],
};
