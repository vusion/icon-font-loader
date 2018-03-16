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
    const beforeTreatmentProcess = plugin.beforeTreatmentProcess;
    const startCodepoint = plugin.options.startCodepoint;
    const property = plugin.options.property;
    const mergeDuplicates = plugin.options.mergeDuplicates;
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
            let md5Code, index;
            const result = {
                url,
                add: false,
                file,
            };
            if (mergeDuplicates) {
                const filesContent = fs.readFileSync(file);
                md5Code = utils.md5Create(filesContent);
                index = md5s.indexOf(md5Code);
                result.md5Code = md5Code;
            } else
                index = files.indexOf(file);
            result.index = index;
            result.declaration = declaration;
            result.rule = declaration.parent;
            if (index < 0)
                result.add = true;
            return result;
        }));
        reg.lastIndex = 0;
    });

    if (promises.length > 0)
        plugin.shouldGenerate = true;
    const template = handlebars.compile(plugin.options.localCSSTemplate);
    // console.log('loader start:' + this.remainingRequest);
    console.log(`icon-font path resovle: ${this.remainingRequest}`);
    const resolvePromise = Promise.all(promises);
    beforeTreatmentProcess.then((content) => {
        plugin.beforeTreatmentProcess = resolvePromise.then((results) => {
            console.log(`icon-font content resovle: ${this.remainingRequest}`);
            const contents = {};
            results.forEach((item) => {
                // const { url, add, file, md5Code } = item;
                const url = item.url;
                const add = item.add;
                const file = item.file;
                const md5Code = item.md5Code;
                const declaration = item.declaration;
                const rule = item.rule;
                let index = item.index;
                if (add) {
                    files.push(file);
                    if (mergeDuplicates)
                        md5s.push(md5Code);
                    index = files.length - 1;
                }
                rule.removeChild(declaration);
                rule.isFontCssselector = true;
                // save svg font code
                contents[url] = '\\' + (startCodepoint + index).toString(16);
                rule.append(`\n\tcontent:'${contents[url]}';`);
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
            return this.remainingRequest;
        }).catch((err) => {
            callback(err, source);
        });
    });
}

iconFontLoader.Plugin = Plugin;

iconFontLoader.acceptPostCssAst = true;

module.exports = iconFontLoader;
