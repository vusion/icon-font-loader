const fs = require('fs');
const path = require('path');
const runWebpack = require('base-css-image-loader/test/fixtures/runWebpack');
const expect = require('chai').expect;

const caseName = 'public-path';

describe(`Webpack Integration Tests: ${caseName}`, () => {
    it('#test webpack public-path with string ' + caseName, (done) => {
        runWebpack(caseName, { casesPath: path.resolve(__dirname, './cases') }, (err, data) => {
            if (err)
                return done(err);

            const cssContent = fs.readFileSync(path.resolve(data.outputPath, 'bundle.js')).toString();
            expect(cssContent.includes('http://cdn.163.com/cdn/static/icon-font.ttf')).to.be.true;
            done();
        });
    });
});
