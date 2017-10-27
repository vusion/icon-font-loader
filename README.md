# icon-font-loader

Import svg files through a virtual property `icon-font` in CSS. And generate icon fonts after collecting all svgs.

This could be seen as an equivalent substitution from characters to font icons.

[![CircleCI][circleci-img]][circleci-url]
[![NPM Version][npm-img]][npm-url]
[![Dependencies][david-img]][david-url]
[![NPM Download][download-img]][download-url]

[circleci-img]: https://img.shields.io/circleci/project/github/vusion/icon-font-loader.svg?style=flat-square
[circleci-url]: https://circleci.com/gh/vusion/icon-font-loader
[npm-img]: http://img.shields.io/npm/v/icon-font-loader.svg?style=flat-square
[npm-url]: http://npmjs.org/package/icon-font-loader
[david-img]: http://img.shields.io/david/vusion/icon-font-loader.svg?style=flat-square
[david-url]: https://david-dm.org/vusion/icon-font-loader
[download-img]: https://img.shields.io/npm/dm/icon-font-loader.svg?style=flat-square
[download-url]: https://npmjs.org/package/icon-font-loader

## Example

``` css
.select:after {
    icon-font: url('../icons/arrow-down.svg');
    color: #666;
}
```

will be transformed to the following codes by icon-font-loader

``` css
.select:after {
    font-family: 'icon-font';
    font-style: normal;
    font-weight: normal;
    ...
    content: '\f106';
    color: #666;
}
```

(eot,svg,ttf,woff) fonts and a global `@font-face` file will be generated after collecting all svgs.

## Install

``` shell
npm install --save-dev icon-font-loader
```

## Config

This loader is against CSS files while a Plugin is required to collect svgs and generate font icons.

```javascript
const IconFontPlugin = require('icon-font-loader').Plugin;

module.exports = {
    ...
    module: {
        rules: [{ test: /\.css$/, use: ['style-loader', 'css-loader', 'icon-font-loader'] }],
    },
    plugins: [new IconFontPlugin()],
};
```

This plugin will insert a `<style>` tag in your document head to import and define the icon font.

``` css
@font-face {
	font-family: "icon-font";
	src: url("icon-font.eot?4063944d4c3fb8fa7bf4c19ad0f59965?#iefix") format("embedded-opentype"),
	url("icon-font.woff?4063944d4c3fb8fa7bf4c19ad0f59965") format("woff"),
	url("icon-font.ttf?4063944d4c3fb8fa7bf4c19ad0f59965") format("truetype"),
	url("icon-font.svg?4063944d4c3fb8fa7bf4c19ad0f59965#icon-font") format("svg");
}
```

### loader options

None.

### plugin options

#### fontName

Name of font family and font files.

- Type: `string`
- Default; `icon-font`

#### output

Path of font and css files relative to webpack output path.

- Type: `string`
- Default: `./`

#### localCSSTemplate

Template of virtual property transformed local CSS. It accepts template content instead of a template file path。

- Type: `string`
- Default: [content of global.css.hbs'](https://github.com/vusion/icon-font-loader/blob/master/src/global.css.hbs)

#### property

Virtual CSS property name

- Type: `string`
- Default: `icon-font`

#### auto

Whether insert `@font-face` into the document with a style tag automatically or emit a css file.

- Type: `boolean`
- Default: true

#### mergeDuplicates

Whether merge duplicated icons in font file. It can shrink built font file, but make compilation slower. It's better to enable this option in production mode.

- Type: `boolean`
- Default: false
