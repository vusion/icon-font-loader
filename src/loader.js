'use strict';

const postcssPlugin = require('./postcssPlugin');
const { createLoader } = require('base-css-image-loader');

const iconFontLoader = createLoader([postcssPlugin]);
iconFontLoader.Plugin = require('./Plugin');

module.exports = iconFontLoader;
