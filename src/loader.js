'use strict';

const postcssPlugin = require('./postcssPlugin');
const BaseLoader = require('base-css-image-loader');

const Plugin = require('./Plugin');

const iconFontLoader = BaseLoader.loader([postcssPlugin]);

iconFontLoader.Plugin = Plugin;

iconFontLoader.acceptPostCssAst = true;

module.exports = iconFontLoader;
