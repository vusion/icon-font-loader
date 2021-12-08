const webpackAlias = require('base-css-image-loader/test/fixtures/webpackAlias');

webpackAlias(process.env.WEBPACK_VERSION, null, ['html-webpack-plugin']);

require('./unit.test.js');
require('./integration.test.js');
// require('./extract-text-webpack.test.js');
require('./babel.test.js');
require('./mini-css-extract-plugin.test.js');
require('./public-path.test.js');
require('./entries.test.js');

