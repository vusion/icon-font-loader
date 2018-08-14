const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const expect = require('chai').expect;
const utils = require('../src/utils');
const shell = require('shelljs');
const execa = require('execa');

const value = 'public-path';

describe('Webpack Integration Tests', () => {
    const buildCLI = path.resolve(__dirname, '../node_modules/.bin/webpack');
    const runDir = path.join('../tests/cases/' + value);
    const outputDirectory = path.join('./cases/' + value + '/dest');
    before(() => {
        shell.cd(path.resolve(__dirname, runDir));
    });
    afterEach(() => {
        shell.rm('-rf', path.resolve(__dirname, outputDirectory));
    });

    it('#test webpack public-path with string: ' + value, (done) => {
        execa(buildCLI, ['--config', './webpack.config.js']).then((res) => {
            const resultReg = /http:\/\/cdn.163.com\/cdn\/static\/icon-font.ttf/g;
            const cssContent = fs.readFileSync(path.resolve(__dirname, outputDirectory + '/bundle.js')).toString();
            expect(resultReg.test(cssContent)).to.eql(true);
            done();
        });
    });
});
