# icon-font-loader

Import svg files by using a virtual property `icon-font` in CSS. And generate icon fonts after collecting all svgs.

This could be seen as an equivalent substitution from characters to font icons.

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

According to output path, add a stylesheet `<link>` tag in html files, like

``` html
<link rel="stylesheet" type="text/css" href="icon-font.css">
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

Template of virtual property transformed local CSS.

- Type: `string`
- Default: [global.css.hbs](https://github.com/vusion/icon-font-loader/blob/master/src/global.css.hbs)

#### globalCSSTemplate

Template of global CSS containing `@font-face`.

- Type: `string`
- Default: [local.css.hbs](https://github.com/vusion/icon-font-loader/blob/master/src/local.css.hbs)
