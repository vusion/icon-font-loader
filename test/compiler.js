/**
 * Created by moujintao on 2017/5/24.
 */
const webpack = require('webpack');
const config = require('./webpack.config.js');
const path = require('path');
const fs = require('fs');


const compiler = webpack(config);
// compiler.watch({}, err => {
compiler.run(err => {
    if (err) {
        console.error(err)
        throw err;
    }
});