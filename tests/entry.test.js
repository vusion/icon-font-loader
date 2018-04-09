const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { expect } = require('chai');
const utils = require('../src/utils');
const shell = require('shelljs');
const execa = require('execa');

const value = 'entry-test';
const replaceReg = /ICON_FONT_LOADER_IMAGE\(([^)]*)\)/g;

describe('Webpack Integration Tests', () => {
    const buildCLI = path.resolve(__dirname,'../node_modules/.bin/webpack');
    const runDir = path.join('../tests/fixtures/'+value);
    const outputDirectory = path.join('./fixtures/'+value+'/dest');
    before(() => {
        shell.cd(path.resolve(__dirname, runDir));
    });
    afterEach(() => {
        shell.rm('-rf',path.resolve(__dirname, outputDirectory));
    });

    it('#test webpack entry with string: ' + value, (done) => {
        execa(buildCLI, ['--config', './webpack.config.string.js']).then((res) => {
            const files = fs.readdirSync(path.resolve(__dirname, outputDirectory));
            expect(files).to.eql([
                'icon-font.eot',
                'icon-font.svg',
                'icon-font.ttf',
                'icon-font.woff',
                'main.02244813a966895a9bdb.js',
            ]);
            done();
        });
    });
    it('#test webpack entry with array: ' + value, (done) => {
        execa(buildCLI, ['--config', './webpack.config.array.js']).then((res) => {
            const files = fs.readdirSync(path.resolve(__dirname, outputDirectory));
            expect(files).to.eql([
                'icon-font.eot',
                'icon-font.svg',
                'icon-font.ttf',
                'icon-font.woff',
                'main.02244813a966895a9bdb.js',
            ]);
            done();
        });
    });
    it('#test webpack entry with function return string: ' + value, (done) => {
        execa(buildCLI, ['--config', './webpack.config.function.js']).then((res) => {
            const files = fs.readdirSync(path.resolve(__dirname, outputDirectory));
            expect(files).to.eql([
                'icon-font.eot',
                'icon-font.svg',
                'icon-font.ttf',
                'icon-font.woff',
                'main.02244813a966895a9bdb.js',
            ]);
            done();
        });
    });
    it('#test webpack entry with function return array: ' + value, (done) => {
        execa(buildCLI, ['--config', './webpack.config.function.array.js']).then((res) => {
            const files = fs.readdirSync(path.resolve(__dirname, outputDirectory));
            expect(files).to.eql([
                'icon-font.eot',
                'icon-font.svg',
                'icon-font.ttf',
                'icon-font.woff',
                'main.02244813a966895a9bdb.js',
            ]);
            done();
        });
    });
    it('#test webpack entry with object: ' + value, (done) => {
        execa(buildCLI, ['--config', './webpack.config.object.js']).then((res) => {
            const files = fs.readdirSync(path.resolve(__dirname, outputDirectory));
            expect(files).to.eql([
                'bundle.a677216fd5fd1ff832ae.js',
                'icon-font.eot',
                'icon-font.svg',
                'icon-font.ttf',
                'icon-font.woff',
            ]);
            done();
        });
    });
    it('#test webpack entry with function return object: ' + value, (done) => {
        execa(buildCLI, ['--config', './webpack.config.function.object.js']).then((res) => {
            const files = fs.readdirSync(path.resolve(__dirname, outputDirectory));
            expect(files).to.eql([
                'bundle.a677216fd5fd1ff832ae.js',
                'icon-font.eot',
                'icon-font.svg',
                'icon-font.ttf',
                'icon-font.woff',
            ]);
            done();
        });
    });
});
