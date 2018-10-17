const postcss = require('postcss');
const path = require('path');
const fs = require('fs');
const utils = require('./utils');
const handlebars = require('handlebars');

module.exports = postcss.plugin('parse-icon-font', ({ loaderContext }) => (styles, result) => {
    const promises = [];
    const plugin = loaderContext.iconFontPlugin;
    const files = plugin.files;
    const md5s = plugin.md5s;
    const startCodepoint = plugin.options.startCodepoint;
    const property = plugin.options.property;
    const reg = new RegExp(`url\\(["']?(.*?)["']?\\)`, 'g');
    styles.walkDecls(property, (declaration) => {
        const result = reg.exec(declaration.value);
        const url = result[1];
        if (path.extname(url) !== '.svg') {
            throw new Error(`Do not accept images in png format as the source image of the font icon, please replace ${url} with svg image `);
        }
        promises.push(new Promise((resolve, reject) => {
            // This path must be resolved by webpack.
            loaderContext.resolve(loaderContext.context, url, (err, result) => err ? reject(err) : resolve(result));
        }).then((file) => {
            loaderContext.addDependency(file);
            const result = {
                url,
                add: false,
                file,
            };
            const filesContent = fs.readFileSync(file);
            const md5Code = 'H' + utils.md5Create(filesContent);
            const index = md5s.indexOf(md5Code);
            result.md5Code = md5Code;
            result.declaration = declaration;
            result.rule = declaration.parent;
            if (index < 0)
                result.add = true;
            else
                result.file = files[index].file;
            return result;
        }));
        reg.lastIndex = 0;
    });
    if (promises.length > 0)
        plugin.shouldGenerate = true;
    const template = handlebars.compile(plugin.options.localCSSTemplate);
    return Promise.all(promises).then((results) => {
        if (results.length > 0)
            loaderContext._module.IconFontSVGModule = true;
        results.forEach((item) => {
            const url = item.url;
            const add = item.add;
            const file = item.file;
            const md5Code = item.md5Code;
            const declaration = item.declaration;
            const rule = item.rule;
            if (add) {
                files.push({ url, file, md5Code });
                md5s.push(md5Code);
            }
            rule.removeChild(declaration);
            rule.isFontCssselector = true;
            rule.append(`\n\tcontent: ICON_FONT_LOADER_IMAGE(${md5Code});`);
        });
        const iconFontCssNames = [];
        styles.walkRules((rule) => {
            if (rule && rule.isFontCssselector && iconFontCssNames.indexOf(rule.selector) === -1)
                iconFontCssNames.push(rule.selector);
        });
        if (iconFontCssNames.length > 0) {
            let cssAdd = template({
                fontName: plugin.options.fontName,
                content: '\\' + startCodepoint.toString(16),
            });
            const iconFontCssNamesStr = iconFontCssNames.join(',');
            cssAdd = `${iconFontCssNamesStr}{\n${cssAdd}\n}\n`;
            styles.insertBefore(styles.first, cssAdd);
        }
    });
});
