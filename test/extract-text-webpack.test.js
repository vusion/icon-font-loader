const fs = require('fs');
const path = require('path');
const runWebpack = require('base-css-image-loader/test/fixtures/runWebpack');
const expect = require('chai').expect;
const utils = require('../src/utils');

const caseName = 'extract-text-webpack-plugin';
const replaceReg = /ICON_FONT_LOADER_IMAGE\(([^)]*)\)/g;

describe(`Webpack Integration Tests: ${caseName}`, () => {
    it('#test webpack extract-text case' + caseName, (done) => {
        runWebpack(caseName, { casesPath: path.resolve(__dirname, './cases') }, (err, data) => {
            if (err)
                return done(err);

            const fileContent = fs.readFileSync(path.resolve(data.outputPath, 'icon-font.svg'));
            const md5Code = utils.genMD5(fileContent);
            expect(md5Code).to.equal('2e9ae90a321bf51c9d358c178af4dea7');
            const cssContent = fs.readFileSync(path.resolve(data.outputPath, 'index.css')).toString();
            expect(replaceReg.test(cssContent)).to.be.false;
            done();
        });
    });
});
