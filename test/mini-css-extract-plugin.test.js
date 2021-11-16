const fs = require('fs');
const path = require('path');
const runWebpack = require('base-css-image-loader/test/fixtures/runWebpack');
const expect = require('chai').expect;
const utils = require('../src/utils');

const caseName = 'mini-css-extract-plugin';
const replaceReg = /ICON_FONT_LOADER_IMAGE\(([^)]*)\)/g;

describe(`Webpack Integration Tests: ${caseName}`, () => {
    it('#test webpack css-extract case: ' + caseName, (done) => {
        runWebpack(caseName, { casesPath: path.resolve(__dirname, './cases') }, (err, data) => {
            if (err)
                return done(err);

            const fileContent = fs.readFileSync(path.resolve(data.outputPath, 'icon-font.svg'));
            const md5Code = utils.genMD5(fileContent);
            expect(md5Code).to.equal('0b166563511b16d0b5f76b97ed15880f');
            const cssContent = fs.readFileSync(path.resolve(data.outputPath, 'bundle.css')).toString();
            expect(replaceReg.test(cssContent)).to.be.false;
            done();
        });
    });
});
