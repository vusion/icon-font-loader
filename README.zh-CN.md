# icon-font-loader

- [README in English](README.md)

这是一款可以自动将 svg 转换成字体图标的 Webpack loader。

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
- Default: `'icon-font'`

#### filename

用于设置生成文件名的模板，类似于 Webpack 的 output.filename。模板支持以下占位符：

- `[ext]` 生成资源文件后缀
- `[name]` 字体名称
- `[fontName]` 字体名称，`[name]`的别名
- `[hash]` 生成文件中 svg 文件的 hash 值（默认使用16进制 md5 hash，所有文件使用 svg 的 hash，其他文件的 hash 有时会发生改变）
- `[<hashType>:hash:<digestType>:<length>]` 生成 hash 的样式
    - `hashType` hash 类型，比如：`sha1`, `md5`, `sha256`, `sha512`
    - `digestType` 数字进制：`hex`, `base26`, `base32`, `base36`, `base49`, `base52`, `base58`, `base62`, `base64`
    - `length` 字符长度


- Type: `string`
- Default: `'[name].[ext]?[hash]'`

#### output

字体和 CSS 等文件相对于 webpack 的 output 的相对路径。**必须是一个相对路径。**

- Type: `string`
- Default: `'./'`

#### publicPath

字体在 CSS url 中的路径，与 Webpack 的 publicPath 相同，此选项用于覆盖它。

- Type: `String`
- Default: `''`

#### localCSSTemplate

局部 CSS 虚拟属性转换后内容, 接受模板内容而不是模板文件的路径。

如果设置该选项值为空，则不会生成局部 CSS。

- Type: `string`
- Default: [global.css.hbs的内容](https://github.com/vusion/icon-font-loader/blob/master/src/global.css.hbs)

比如，该模板变量会生成下面 CSS 规则中的内容。

``` css
.icon-1::before, .icon-2::before .icon-3::before {
    font-family: '{{ fontName }}';
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-decoration: inherit;
    text-rendering: optimizeLegibility;
    text-transform: none;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    font-smoothing: antialiased;
}
```

#### localCSSSelector

局部 CSS 的选择器默认是当前文件所有图标选择器的合并。

如果设置该选项，默认的选择器会被设置的值代替。

- Type: `string`
- Default: `''`

举例说明，比如设置该选项为`'.my-icon'`, 局部 CSS 会生成成下面的代码:

``` css
.my-icon {
    font-family: '{{ fontName }}';
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-decoration: inherit;
    text-rendering: optimizeLegibility;
    text-transform: none;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    font-smoothing: antialiased;
}
```

#### property

CSS 的自定义属性名

- Type: `string`
- Default: `'icon-font'`

#### auto

是否在chunk中自动插入@font-face css 片段。如果不希望每一chunk都插入这段css，那么设置这个参数未false，我们将会生成额外的css文件供手动插入。

- Type: `boolean`
- Default: `true`

#### dataURL

如果设置为`true`，字体会转换成 data base64 嵌入到 CSS 中，而不是生成对应的字体文件。

在字体图标不多的情况下推荐使用，因为字体文件会产生额外的请求。

- Type: `boolean`
- Default: `false`

#### startCodepoint

- Type: `number`
- Default: `0xF101`

unicode 的字符起始点。

#### fontOptions

- Type: `Object`
- Default: `{}`

这个属性将直接覆盖掉[svgicons2svgfont](https://github.com/nfroidure/svgicons2svgfont)的属性，可以通过这个属性设置字体图标生成后的大小及上下偏移量。

#### entries

指定需要插入字体文件引入css的入口，如果没有指定或者是空数组，那么将会为所有的入口插入字体引入样式。

- Type: `Array`
- Default: `undefined`

## 修改日志

参见[Releases](https://github.com/vusion/icon-font-loader/releases)

## 贡献指南

参见[Contributing Guide](https://github.com/vusion/DOCUMENTATION/issues/4)

## 开源协议

参见[LICENSE](LICENSE)
