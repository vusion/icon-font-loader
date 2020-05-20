const postcss = require('postcss');
const path = require('path');
const fs = require('fs');
const utils = require('./utils');
const handlebars = require('handlebars');
const meta = require('./meta');

module.exports = postcss.plugin('icon-font-parser', ({ loaderContext }) => (styles, result) => {
    const promises = [];
    const plugin = loaderContext[meta.PLUGIN_NAME];
    const data = plugin.data;
    const pathMap = plugin.pathMap;
    const property = plugin.options.property;
    const reg = /url\(["']?(.*?)["']?\)/;

    if (plugin.fontFacePath === loaderContext.resourcePath) {
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
                id: undefined,
                filePath,
                url,
            };

            // Using file content hash instead of absolute file path can prevent cache buster changed.
            const fileContent = fs.readFileSync(filePath);
            file.id = 'ID' + utils.genMD5(fileContent);
            // add new file and check old mapping
            // @warning: module change can not apply to data, like delete module reference
            if (!data[file.id]) {
                data[file.id] = file;
                if (pathMap[filePath]) {
                    const id = pathMap[filePath];
                    data[id] = undefined;
                    delete data[id];
                }
                pathMap[filePath] = file.id;
            }

            declaration.prop = 'content';
            declaration.value = `${meta.REPLACER_NAME}(${file.id})`;
            const rule = declaration.parent;
            rule.hasIconFont = true;

            return file;
        }));
    });

    if (promises.length) {
        plugin.shouldGenerate = true;
        loaderContext._module[meta.MODULE_MARK] = true;
    }

    return Promise.all(promises).then(() => {
        /**
         * Merge selectors
         * .font1, .font2, .font3 {
         *     font-family: ...;
         *     font-style: normal;
         *     ...
         * }
         */
        if (!plugin.options.localCSSTemplate) // Empty will disable insert this css rule
            return;
        const template = handlebars.compile(plugin.options.localCSSTemplate);

        const fontSelectors = [];
        styles.walkRules((rule) => {
            if (rule && rule.hasIconFont && !fontSelectors.includes(rule.selector))
                fontSelectors.push(rule.selector);
        });
        let localCSSSelector = plugin.options.localCSSSelector;
        if (!localCSSSelector) {
            if (plugin.options.smartSelector) {
                const selectorMap = {};
                fontSelectors.forEach((selector) => {
                    selector = selector.replace(/\[.*?\]/g, '');
                    selectorMap[selector] = true;
                });
                localCSSSelector = Object.keys(selectorMap).join(',');
            } else
                localCSSSelector = fontSelectors.join(',');
        }

        if (localCSSSelector) {
            const localCSS = template({ fontName: plugin.options.fontName });
            styles.insertBefore(styles.first, `${localCSSSelector} {\n${localCSS}\n}`);
        }
    });
});
