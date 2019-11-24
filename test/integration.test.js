const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const cases = ['default', 'more-css', 'same-name', 'options', 'public-path', 'property', 'custom-selector', 'font-options', 'html-webpack-plugin', 'sass-loader'];

describe('Webpack Integration Tests', () => {
    cases.forEach((caseName) => {
        it('#test webpack integration case: ' + caseName, (done) => {
            const configPath = path.join('../test/cases/', caseName, '/webpack.config.js');
            const destPath = path.join('/cases/', caseName, '/dest');
            const options = require(configPath);
            for (const chunk of Object.keys(options.entry))
                options.entry[chunk] = path.join(__dirname, '/cases/', caseName, options.entry[chunk]);

            webpack(options, (err, stats) => {
                if (err)
                    return done(err);
                if (stats.hasErrors())
                    return done(new Error(stats.toString()));
                // todo checkout result file context
                done();
            });
        });
    });
});
