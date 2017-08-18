# icon-font-loader

通过icon-font属性引入svg文件，最终将svg打包成字体文件，并替换css文件中的内容为字体图标插入内容

## Install

```
npm install --save-dev icon-font-loader

```

## 示例

``` css
.head:after {
    icon-font: url('../icons/arrow-down.svg');
}
```

通过icon-font-loader将会转变为

``` css
.head:after {
    font-family: 'IconFont';
    font-style: normal;
    font-weight: normal;
    ...
    content: '\f106';
}
```

(eot,svg,ttf,woff) fonts, and a global `@font-face` file imported automatically.

## 使用方法

### loader的使用

与普通loader相同

```javascript
//配置css文件引用如下
{ test: /\.css$/, use:["style-loader","css-loader","icon-font-loader"]}
```

### plugin引入

本插件依赖于plugin生成字体文件，所以需要引入plugin来实现字体的最终打包，plugin对象被集成与loader function中通过loader.iconFontCreatPlugin引入

```javascript
//配置css文件引用如下
const FontIconCreatePlugin = require('icon-font-loader').iconFontCreatPlugin;

const fontIconCreatePluginInstance =new FontIconCreatePlugin({
     name:"iconDD",
     output:{font:"src/iconfont",css:"css/"},
     publishPath:"/dist/src/iconfont/"
 });

module.exports = {
    plugins: [
        fontIconCreatePluginInstance,
    ],
}

```
### plugin支持参数

#### name
字体图标库名称，默认值 iconFont

#### output

文件输出目录，webpack output路径的相对路径，接受string或者是object两种类型
object类型接受字体文件生成路径与css文件生成路径

```javascript
{
    css:"css文件路径",
    font:"字体文件路径"
}

```

#### publishPath

发布路径，替换字体引入的地址，通常用cdn路径或者是网站静态资源路径

默认生成的字体引用

```css
@font-face {
    font-family: "iconDD";
    src: url("/iconDD.eot?v={hash}") format("embedded-opentype"),
    url("/iconDD.woff?v={hash}") format("woff"),
    url("/iconDD.ttf?v={hash}") format("truetype"),
    url("/iconDD.svg?v={hash}#iconFont") format("svg");
    font-weight: normal;
    font-style: normal;
}
```
配置 publishPath = /dist/src/iconfont生成样式

```css
@font-face {
    font-family: "iconDD";
    src: url("/dist/src/iconfont/iconDD.eot?v={hash}") format("embedded-opentype"),
    url("/dist/src/iconfont/iconDD.woff?v={hash}") format("woff"),
    url("/dist/src/iconfont/iconDD.ttf?v={hash}") format("truetype"),
    url("/dist/src/iconfont/iconDD.svg?v={hash}#iconFont") format("svg");
    font-weight: normal;
    font-style: normal;
}
```


