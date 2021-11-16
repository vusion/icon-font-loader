const fs = require('fs');
const path = require('path');
const runWebpack = require('base-css-image-loader/test/fixtures/runWebpack');
const expect = require('chai').expect;

const caseName = 'babel-loader';
const replaceReg = /\$\{ICON_FONT_STYLE\}/g;

describe(`Webpack Integration Tests: ${caseName}`, () => {
    it('#test webpack babel case' + caseName, (done) => {
        runWebpack(caseName, { casesPath: path.resolve(__dirname, './cases') }, (err, data) => {
            if (err)
                return done(err);

            const cssContent = fs.readFileSync(path.resolve(data.outputPath, 'bundle.js')).toString();
            expect(replaceReg.test(cssContent)).to.be.false;
            done();
        });
    });
});
