const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const shell = require('shelljs');
const _runWebpack = require('base-css-image-loader/test/fixtures/runWebpack');

const caseName = 'entries';

const runWebpack = (webpackConfig, done) => {
    _runWebpack(
        caseName,
        {
            casesPath: path.resolve(__dirname, './cases'),
            webpackConfig
        },
        () => done()
    )
}

describe(`Webpack Integration Tests: ${caseName}`, () => {
    const runDir = path.join('../test/cases/' + caseName);
    const outputDirectory = path.join('./cases/' + caseName + '/dest');
    before(() => {
        shell.cd(path.resolve(__dirname, runDir));
    });
    afterEach(() => {
        shell.rm('-rf', path.resolve(__dirname, outputDirectory));
    });

    it('#test webpack entry with string ' + caseName, (done) => {
        runWebpack(require(`./cases/${caseName}/webpack.config.string.js`) , () => {
            const files = fs.readdirSync(path.resolve(__dirname, outputDirectory));
            expect(files).to.eql([
                'icon-font.eot',
                'icon-font.svg',
                'icon-font.ttf',
                'icon-font.woff',
                'main.js',
            ]);
            done();
        });
    });
    it('#test webpack entry with array ' + caseName, (done) => {
        runWebpack(require(`./cases/${caseName}/webpack.config.array.js`), () => {
            const files = fs.readdirSync(path.resolve(__dirname, outputDirectory));
            expect(files).to.eql([
                'icon-font.eot',
                'icon-font.svg',
                'icon-font.ttf',
                'icon-font.woff',
                'main.js',
            ]);
            done();
        });
    });
    it('#test webpack entry with function return string ' + caseName, (done) => {
        runWebpack(require(`./cases/${caseName}/webpack.config.function.js`), () => {
            const files = fs.readdirSync(path.resolve(__dirname, outputDirectory));
            expect(files).to.eql([
                'icon-font.eot',
                'icon-font.svg',
                'icon-font.ttf',
                'icon-font.woff',
                'main.js',
            ]);
            done();
        });
    });
    it('#test webpack entry with function return array ' + caseName, (done) => {
        runWebpack(require(`./cases/${caseName}/webpack.config.function.array.js`), () => {
            const files = fs.readdirSync(path.resolve(__dirname, outputDirectory));
            expect(files).to.eql([
                'icon-font.eot',
                'icon-font.svg',
                'icon-font.ttf',
                'icon-font.woff',
                'main.js',
            ]);
            done();
        });
    });
    it('#test webpack entry with object ' + caseName, (done) => {
        runWebpack(require(`./cases/${caseName}/webpack.config.object.js`), () => {
            const files = fs.readdirSync(path.resolve(__dirname, outputDirectory));
            expect(files).to.eql([
                'bundle.js',
                'icon-font.eot',
                'icon-font.svg',
                'icon-font.ttf',
                'icon-font.woff',
            ]);
            done();
        });
    });
    it('#test webpack entry with function return object ' + caseName, (done) => {
        runWebpack(require(`./cases/${caseName}/webpack.config.function.object.js`), () => {
            const files = fs.readdirSync(path.resolve(__dirname, outputDirectory));
            expect(files).to.eql([
                'bundle.js',
                'icon-font.eot',
                'icon-font.svg',
                'icon-font.ttf',
                'icon-font.woff',
            ]);
            done();
        });
    });
});
