'use strict';

const fs = require('fs');
const handlebars = require('handlebars');
const utils = require('./utils');
const css = require('postcss');

const Plugin = require('./Plugin');

function getNextLoader(loader) {
    const loaders = loader.loaders;
    const previousRequest = loader.previousRequest;
    const loaderContexts = loaders.map((loader) => loader.normalExecuted);
    const index = loaderContexts.lastIndexOf(false);
    const nextLoader = loaders[index].normal;
    return nextLoader;
}

function iconFontLoader(source) {
    const callback = this.async();

    this.cacheable();
    const plugin = this.iconFontPlugin;
    const files = plugin.files;
    const md5s = plugin.md5s;
    const startCodepoint = plugin.options.startCodepoint;
    const property = plugin.options.property;
    // const mergeDuplicates = plugin.options.mergeDuplicates;
    const reg = new RegExp(`url\\(["']?(.*?)["']?\\)`, 'g');

    const promises = [];
    const ast = typeof source === 'string' ? css.parse(source) : source;
    const acceptPostCssAst = !!getNextLoader(this).acceptPostCssAst;
    ast.walkDecls(property, (declaration) => {
        const result = reg.exec(declaration.value);
        const url = result[1];
        promises.push(new Promise((resolve, reject) => {
            // This path must be resolved by webpack.
            this.resolve(this.context, url, (err, result) => err ? reject(err) : resolve(result));
        }).then((file) => {
            this.addDependency(file);
            const result = {
                url,
                add: false,
                file,
            };
            const filesContent = fs.readFileSync(file);
            const md5Code = utils.md5Create(filesContent);
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
    Promise.all(promises).then((results) => {
        if (results.length > 0)
            this._module.IconFontSVGModule = true;
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
        let cssStr = '';
        const iconFontCssNames = [];
        ast.walkRules((rule) => {
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
            ast.insertBefore(ast.first, cssAdd);
        }
        // css rule stringify
        if (!acceptPostCssAst) {
            css.stringify(ast, (str, map) => {
                cssStr += str;
            });
        }
        callback(null, acceptPostCssAst ? ast : cssStr);
    }).catch((err) => {
        callback(err, source);
    });
}

iconFontLoader.Plugin = Plugin;

iconFontLoader.acceptPostCssAst = true;

module.exports = iconFontLoader;
