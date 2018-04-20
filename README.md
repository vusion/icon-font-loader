# icon-font-loader

A webpack loader to convert svgs into font icons in CSS.

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

Import svg file with a custom property called `icon-font` by default where you want to use icon font in CSS:

``` css
.select:after {
    icon-font: url('../icons/arrow-down.svg');
    color: #666;
}
```

Then `icon-font-loader` will generate corresponding css so web browsers can recognize.

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

After packing all these imports, the loader will create font files (eot,svg,ttf,woff), and insert a `<style>` tag into the `<head>` automatically or emit a CSS file containing `@font-face`.

``` css
@font-face {
    font-family: "icon-font";
    src: url("icon-font.eot?4063944d4c3fb8fa7bf4c19ad0f59965?#iefix") format("embedded-opentype"),
         url("icon-font.woff?4063944d4c3fb8fa7bf4c19ad0f59965") format("woff"),
         url("icon-font.ttf?4063944d4c3fb8fa7bf4c19ad0f59965") format("truetype"),
         url("icon-font.svg?4063944d4c3fb8fa7bf4c19ad0f59965#icon-font") format("svg");
}
```

## Features

Our loader works in a way different to others:

- css only. You can override existing style like this:
    ```
    .select:after {
        icon-font: url('../icons/arrow-down.svg');
        color: #666;
    }

    .select.up:after {
        icon-font: url('../icons/arrow-up.svg');
    }
    ```
- pseudo elements(`before` or `after`) only. We treat these icon fonts as some certain characters under one font-famliy by using their property `content`.
- Merge duplicated svgs. We will merge those same svgs into only one to keep slim even they lie in different places in your project.

## Install

``` shell
npm install --save-dev icon-font-loader
```

## Config

You must import plugin below in webpack in addition to adding custom properties in CSS.

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

### loader options

None.

### plugin options

#### fontName

Name of font family and font files.

- Type: `string`
- Default; `icon-font`

#### output

Path of font and css files relative to webpack output path. **Must be a relative path.**

- Type: `string`
- Default: `./`

#### localCSSTemplate

Template of virtual property transformed local CSS. It accepts template content instead of a template file path。

- Type: `string`
- Default: [content of global.css.hbs](https://github.com/vusion/icon-font-loader/blob/master/src/global.css.hbs)

#### property

Custom CSS property name

- Type: `string`
- Default: `icon-font`

#### auto

Whether to insert `@font-face` into the `<head>` with a `<style>` tag automatically or emit a css file.

- Type: `boolean`
- Default: true

#### mergeDuplicates

Whether to merge duplicated icons in font file. If true, it will shrink font file after built, but this makes compilation slower. Recommand that you enable this option in production mode.

- Type: `boolean`
- Default: false

#### startCodepoint

- Type: `number`
- Default: `0xF101`

Starting codepoint. Defaults to beginning of unicode private area.

#### fontOptions

- Type: `Object`
- Default: normalize, fontHeight, round, descent

Options that are passed directly to
[svgicons2svgfont](https://github.com/nfroidure/svgicons2svgfont).

#### publicPath

- Type: `String`
- Default: undefined

font file public path in css file, this publicPath will cover webpack‘publicPath,and we will generate public path `publicPath/fileName`;

## Changelog

See [Releases](https://github.com/vusion/icon-font-loader/releases)

## Contributing

See [Contributing Guide](https://github.com/vusion/DOCUMENTATION/issues/8)

## License

See [LICENSE](LICENSE)

