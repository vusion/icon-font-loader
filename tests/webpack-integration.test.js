const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const testCase = ['default', 'options', 'same-name'];

describe('Webpack Integration Tests', () => {
    testCase.forEach((value) => {
        it('#test webpack integration case: ' + value, (done) => {
            const configPath = path.join('../tests/fixtures/', value, '/webpack.config.js');
            const outputDirectory = path.join('/fixtures/', value, '/dest');
            const options = require(configPath);
            for(const chunck of Object.keys(options.entry)){
                options.entry[chunck] = path.join(__dirname,'/fixtures/',value,options.entry[chunck]);
            };
            webpack(options, (err, stats) => {
                if (err) return done(err);
                if (stats.hasErrors()) return done(new Error(stats.toString()));
                done();
            });
        });
    });
});