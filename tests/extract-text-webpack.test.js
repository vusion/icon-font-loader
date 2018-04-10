const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const expect = require('chai').expect;
const utils = require('../src/utils');

const value = 'extract-text-webpack-plugin';
const replaceReg = /ICON_FONT_LOADER_IMAGE\(([^)]*)\)/g;

describe('Webpack Integration Tests', () => {
    const configPath = path.join('../tests/fixtures/'+value+'/webpack.config.js');
    const outputDirectory = path.join('./fixtures/'+value+'/dest');
    const options = require(configPath);
    for (const chunk of Object.keys(options.entry))
        options.entry[chunk] = path.join(__dirname, '/fixtures/', value, options.entry[chunk]);

    it('#test webpack extract-text case: ' + value, (done) => {
        webpack(options, (err, stats) => {
            if (err)
                return done(err);
            if (stats.hasErrors())
                return done(new Error(stats.toString()));
            const files = fs.readdirSync(path.resolve(__dirname, outputDirectory));
            expect(files).to.eql([
                'bundle.f9228c8854bd9d2955bb.js',
                'icon-font.eot',
                'icon-font.svg',
                'icon-font.ttf',
                'icon-font.woff',
                'index.css'
            ]);
            const filesContent = fs.readFileSync(path.resolve(__dirname,outputDirectory+'/icon-font.svg'));
            const md5Code = utils.md5Create(filesContent);
            expect(md5Code).to.eql('65710e1596abed7a7320ad764713d11d');
            const cssContent = fs.readFileSync(path.resolve(__dirname, outputDirectory+'/index.css')).toString();
            expect(replaceReg.test(cssContent)).to.eql(false);
            done();
        });
    });
});
