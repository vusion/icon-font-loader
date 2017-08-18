// var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const path = require('path');
const  webpack =require('webpack');
const FontIconCreatePlugin = require('../index.js').iconFontCreatPlugin;
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var extractLESS = new ExtractTextPlugin({
    filename:"css/[name].css",
    allChunks:true
});
module.exports = {
    entry: {
        bundle: './src/index.js',
        test: './src/iconTest.js',
    },
    output: {
        path: __dirname + '/dist',
        publicPath:"http://127.0.0.1:8080/dist",
        filename: '[name].js',
        // libraryTarget: 'umd',
        // library: ['Foo', '[name]']
    },
    module: {
        rules: [
            { test: /\.svg$/, loader: 'vusion-iconmaker', include: path.join(__dirname, 'src/icons') },
            { test: /\.css$/, use:["style-loader","css-loader",require.resolve("../index.js")]},
            { test: /\.(woff|eot|ttf|svg)$/, loader: 'url-loader', exclude: path.join(__dirname, 'src/icons') }
        ]
    },
    devtool: '#eval-source-map',
    plugins: [
        new FontIconCreatePlugin({
            name:"iconDD",
            output:{font:"src/iconfont",css:"css/"},
            publishPath:"/dist/src/iconfont/"
        }),
        extractLESS,
        new webpack.HotModuleReplacementPlugin()
    ],
}
