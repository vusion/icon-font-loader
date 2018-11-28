const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const expect = require('chai').expect;
const utils = require('../src/utils');

const value = 'extract-text-webpack-plugin';
const replaceReg = /ICON_FONT_LOADER_IMAGE\(([^)]*)\)/g;

describe('Webpack Integration Tests', () => {
    const configPath = path.join('../test/cases/' + value + '/webpack.config.js');
    const outputDirectory = path.join('./cases/' + value + '/dest');
    const options = require(configPath);
    for (const chunk of Object.keys(options.entry))
        options.entry[chunk] = path.join(__dirname, '/cases/', value, options.entry[chunk]);

    it('#test webpack extract-text case: ' + value, (done) => {
        webpack(options, (err, stats) => {
            if (err)
                return done(err);
            if (stats.hasErrors())
                return done(new Error(stats.toString()));
            const filesContent = fs.readFileSync(path.resolve(__dirname, outputDirectory + '/icon-font.svg'));
            const md5Code = utils.genMD5(filesContent);
            expect(md5Code).to.eql('2e9ae90a321bf51c9d358c178af4dea7');
            const cssContent = fs.readFileSync(path.resolve(__dirname, outputDirectory + '/index.css')).toString();
            expect(replaceReg.test(cssContent)).to.eql(false);
            done();
        });
    });
});
