const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const expect = require('chai').expect;
const utils = require('../src/utils');

const value = 'mini-css-extract-plugin';
const replaceReg = /ICON_FONT_LOADER_IMAGE\(([^)]*)\)/g;

describe('Webpack Integration Tests: mini-css-extract-plugin', () => {
    const configPath = path.join('../test/cases/' + value + '/webpack.config.js');
    const outputDirectory = path.join('./cases/' + value + '/dest');
    const options = require(configPath);
    for (const chunk of Object.keys(options.entry))
        options.entry[chunk] = path.join(__dirname, '/cases/', value, options.entry[chunk]);

    it('#test webpack css-extract case: ' + value, (done) => {
        webpack(options, (err, stats) => {
            if (err)
                return done(err);
            if (stats.hasErrors())
                return done(new Error(stats.toString()));
            const fileContent = fs.readFileSync(path.resolve(__dirname, outputDirectory + '/icon-font.svg'));
            const md5Code = utils.genMD5(fileContent);
            expect(md5Code).to.equal('0b166563511b16d0b5f76b97ed15880f');
            const cssContent = fs.readFileSync(path.resolve(__dirname, outputDirectory + '/bundle.css')).toString();
            expect(replaceReg.test(cssContent)).to.be.false;
            done();
        });
    });
});
