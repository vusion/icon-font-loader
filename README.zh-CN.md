# icon-font-loader

icon-font-loader是一款在Webpack中使用的图标加载器，它可以自动将svg转换成字体图标。

## 示例

在CSS中需要使用图标的地方用自定义属性`icon-font`引入svg文件：

``` css
.select:after {
    icon-font: url('../icons/arrow-down.svg');
    color: #666;
}
```

通过icon-font-loader将会转变为浏览器可识别的CSS：

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

加载器会收集所有这样的引用，统一打包成(eot,svg,ttf,woff)字体文件，并生成一个全局的包含`@font-face`的`<style>`标签或CSS文件。

## 特色

与别的类似的字体图标加载器不同的是：

- 在CSS中使用。利用CSS的特性，可以复写图标：
    ``` css
    .select:after {
        icon-font: url('../icons/arrow-down.svg');
        color: #666;
    }

    .select:after {
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

除了在CSS中添加自定义属性，还需要在Webpack配置中添加一个Plugin。

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
在打包结束以后，这个plugin会在文档头部插入一个`<style>`，引入并定义字体。

``` css
@font-face {
    font-family: "icon-font";
    src: url("icon-font.eot?4063944d4c3fb8fa7bf4c19ad0f59965?#iefix") format("embedded-opentype"),
         url("icon-font.woff?4063944d4c3fb8fa7bf4c19ad0f59965") format("woff"),
         url("icon-font.ttf?4063944d4c3fb8fa7bf4c19ad0f59965") format("truetype"),
         url("icon-font.svg?4063944d4c3fb8fa7bf4c19ad0f59965#icon-font") format("svg");
}
```

### loader参数

暂无。

### plugin参数

#### fontName
字体图标的字体名和文件名。

- Type: `string`
- Default: `icon-font`

#### output

字体和CSS等文件对于webpack的output的相对路径。

- Type: `string`
- Default: `./`

#### localCSSTemplate

局部CSS虚拟属性转换后内容, 接受模板内容而不是模板文件的路径。

- Type: `string`
- Default: [global.css.hbs的内容](https://github.com/vusion/icon-font-loader/blob/master/src/global.css.hbs)

#### property

CSS虚拟属性名

- Type: `string`
- Default: `icon-font`

#### auto

是否在document中自动插入`@font-face`，或生成一个含`@font-face`的css文件。

- Type: `boolean`
- Default: true

#### mergeDuplicates

如果有相同的svg文件而它们的文件名或路径不同，是否将它们合并起来。开启后，可以减少生成的字体文件大小，但会增加一定的编译时间，建议在发布阶段开启。

- Type: `boolean`
- Default: false

## 修改日志

参见[Releases](https://github.com/vusion/icon-font-loader/releases)

## 贡献指南

参见[Contributing Guide](https://github.com/vusion/DOCUMENTATION/issues/4)

## 开源协议

参见[LICENSE](LICENSE)
