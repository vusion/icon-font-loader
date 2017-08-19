# icon-font-loader

在CSS中用`icon-font`虚拟属性引入svg文件，收集整理后统一打包成字体文件，然后将刚才的虚拟属性转换为浏览器可识别的CSS。从而实现通过CSS引入字体图标，这个过程可以看作字符和字体图标的等效替换。

## 示例

``` css
.select:after {
    icon-font: url('../icons/arrow-down.svg');
    color: #666;
}
```

通过icon-font-loader将会转变为

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

同时生成(eot,svg,ttf,woff)等字体和一个全局的`@font-face`文件。

## 安装

``` shell
npm install --save-dev icon-font-loader
```

## 配置

本loader针对的是CSS文件，但同时需要添加一个Plugin来打包字体图标。

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
局部CSS虚拟属性转换后内容的模板路径。

- Type: `string`
- Default: [global.css.hbs](https://github.com/vusion/icon-font-loader/blob/master/src/global.css.hbs)

#### globalCSSTemplate
全局CSS`@font-face`内容的模板路径。

- Type: `string`
- Default: [local.css.hbs](https://github.com/vusion/icon-font-loader/blob/master/src/local.css.hbs)
