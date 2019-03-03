const postcss = require('postcss');
const path = require('path');
const fs = require('fs');
const utils = require('./utils');
const handlebars = require('handlebars');
const meta = require('./meta.js');

module.exports = postcss.plugin('icon-font-parser', ({ loaderContext }) => (styles, result) => {
    const promises = [];
    const plugin = loaderContext[meta.PLUGIN_NAME];
    const data = plugin.data;
    const property = plugin.options.property;
    const reg = /url\(["']?(.*?)["']?\)/;
    if (plugin.iconFontStylePath === loaderContext.resourcePath) {
        loaderContext._module.isFontFaceModule = true;
        return Promise.resolve();
    }
    styles.walkDecls(property, (declaration) => {
        const cap = reg.exec(declaration.value);
        const url = cap[1];

        if (path.extname(url) !== '.svg')
            throw new Error(`Image format of '${url}' is not accepted. Please use a svg instead.`);

        promises.push(new Promise((resolve, reject) => {
            // This path must be resolved by webpack.
            loaderContext.resolve(loaderContext.context, url, (err, result) => err ? reject(err) : resolve(result));
        }).then((filePath) => {
            loaderContext.addDependency(filePath);
            const file = {
                url,
                filePath,
                md5: undefined,
            };

            // Using file content hash instead of absolute file path can prevent cache buster changed.
            const fileContent = fs.readFileSync(filePath);
            file.md5 = 'H' + utils.genMD5(fileContent);
            if (!data[file.md5])
                data[file.md5] = file;

            declaration.prop = 'content';
            declaration.value = `ICON_FONT_LOADER_IMAGE(${file.md5})`;
            const rule = declaration.parent;
            rule.hasIconFont = true;

            return file;
        }));
    });

    if (promises.length) {
        plugin.shouldGenerate = true;
        loaderContext._module.isIconFontModule = true;
    }

    const template = handlebars.compile(plugin.options.localCSSTemplate);
    return Promise.all(promises).then(() => {
        const fontSelectors = [];
        styles.walkRules((rule) => {
            if (rule && rule.hasIconFont && !fontSelectors.includes(rule.selector))
                fontSelectors.push(rule.selector);
        });

        if (fontSelectors.length) {
            let localCSS = template({ fontName: plugin.options.fontName });
            localCSS = `${fontSelectors.join(',')} {${localCSS}\n}`;
            styles.insertBefore(styles.first, localCSS);
        }
    });
});
