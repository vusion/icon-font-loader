const path = require('path');
const runWebpack = require('base-css-image-loader/test/fixtures/runWebpack');

const cases = ['default', 'more-css', 'same-name', 'options', 'public-path', 'property', 'custom-selector', 'font-options', 'html-webpack-plugin', 'sass-loader', 'specify-unicode'];

describe('Webpack Integration Tests', () => {
    cases.forEach((caseName) => {
        it('#test webpack integration case: ' + caseName, (done) => {
            runWebpack(caseName, { casesPath: path.resolve(__dirname, './cases') }, done);
        });
    });
});
