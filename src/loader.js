'use strict';

const postcssPlugin = require('./postcssPlugin');
const { createLoader } = require('base-css-image-loader');

const loader = createLoader([postcssPlugin]);
loader.Plugin = require('./Plugin');

module.exports = loader;
