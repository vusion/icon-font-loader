# icon-font-loader

这是一款 Webpack loader，它可以自动将 svg 转换成字体图标。

## 示例

在 CSS 中需要使用图标的地方用自定义属性`icon-font`引入 svg 文件：

``` css
.select:after {
    icon-font: url('../icons/arrow-down.svg');
    color: #666;
}
```

通过 icon-font-loader 将会转变为浏览器可识别的 CSS：

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

加载器会收集所有这样的引用，统一打包成 (eot,svg,ttf,woff) 字体文件，并在`<head>`中插入一个有`@font-face`的`<style>`标签或抛出一个这样的 CSS 文件。

``` css
@font-face {
    font-family: "icon-font";
    src: url("icon-font.eot?4063944d4c3fb8fa7bf4c19ad0f59965?#iefix") format("embedded-opentype"),
         url("icon-font.woff?4063944d4c3fb8fa7bf4c19ad0f59965") format("woff"),
         url("icon-font.ttf?4063944d4c3fb8fa7bf4c19ad0f59965") format("truetype"),
         url("icon-font.svg?4063944d4c3fb8fa7bf4c19ad0f59965#icon-font") format("svg");
}
```

当然，如果开启`dataURL`选项会转换为

``` css
@font-face {
	font-family: "icon-font";
	src:url("data:application/x-font-woff;base64,d09GRgABAAAAAAUkAAsAAAAACQgAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAAHcAAAC4Ifsmu09TLzIAAAGAAAAAPQAAAFZWTEunY21hcAAAAcAAAADxAAACuqtTRqJnbHlmAAACtAAAAEIAAABwWoXqgmhlYBewAAA=") format("woff");
}
```

## 特性

与别的类似的字体图标加载器不同的是：

- 在 CSS 中使用。利用 CSS 的特性，可以很轻松地覆盖原图标：
    ``` css
    .select:after {
        icon-font: url('../icons/arrow-down.svg');
        color: #666;
    }

    .select.up:after {
        icon-font: url('../icons/arrow-up.svg');
    }
    ```
- 必须在`before`或`after`伪元素中使用，我们正是利用了它们的`content`属性，将字体图标视为某种字体下的特殊字符。
- 合并重复的图标。如果有相同的图标而它们的文件名或路径不同，我们会将它们合并起来，减少字体大小。

## 安装

``` shell
npm install --save-dev icon-font-loader
```

## 配置

除了在 CSS 中添加自定义属性，还需要在 Webpack 配置中添加一个 Plugin。

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

### Loader 参数

暂无。

### Plugin 参数

#### fontName

字体图标的字体名和文件名。

- Type: `string`
- Default: `icon-font`

#### output

字体和 CSS 等文件对于 webpack 的 output 的相对路径。**必须是一个相对路径。**

- Type: `string`
- Default: `./`

#### localCSSTemplate

局部 CSS 虚拟属性转换后内容, 接受模板内容而不是模板文件的路径。

- Type: `string`
- Default: [global.css.hbs的内容](https://github.com/vusion/icon-font-loader/blob/master/src/global.css.hbs)

#### property

CSS 的自定义属性名

- Type: `string`
- Default: `icon-font`

#### auto

是否在`<head>`中自动插入有`@font-face`的`<style>`标签，或生成一个含`@font-face`的 CSS 文件。

- Type: `boolean`
- Default: true

### dataURL

如果设置为`true`，字体会转换成 data base64 嵌入到 CSS 中，而不是生成对应的字体文件。

在字体图标不多的情况下推荐使用，因为字体文件会产生额外的请求。

- Type: `boolean`
- Default: false

#### mergeDuplicates

如果有相同的 svg 文件而它们的文件名或路径不同，是否将它们合并起来。开启后，可以减少生成的字体文件大小，但会增加一定的编译时间，建议在发布阶段开启。

- Type: `boolean`
- Default: false

#### startCodepoint

- Type: `number`
- Default: `0xF101`

unicode 的字符起始点。

#### startCodepoint

- Type: `number`
- Default: `0xF101`

unicode 的字符起始点。

#### fontOptions

- Type: `Object`
- Default: normalize, fontHeight, round, descent

这个属性将直接覆盖掉[svgicons2svgfont](https://github.com/nfroidure/svgicons2svgfont)的属性，可以通过这个属性设置字体图标生成后的大小及上下偏移量。

#### publicPath

- Type: `String`
- Default: undefined

这个属性主要用于设置字体图标的发布获取路径，设置了这个路径将会覆盖掉 Webpack 的 publicPath，我们将会生成类似 publicPath + 文件名的文件路径。

## 修改日志

参见[Releases](https://github.com/vusion/icon-font-loader/releases)

## 贡献指南

参见[Contributing Guide](https://github.com/vusion/DOCUMENTATION/issues/4)

## 开源协议

参见[LICENSE](LICENSE)
