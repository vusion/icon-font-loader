'use strict';

const fs = require('fs');
const handlebars = require('handlebars');
const utils = require('./utils');

const Plugin = require('./Plugin');

function iconFontLoader(source) {
    const callback = this.async();

    this.cacheable();
    const plugin = this.iconFontPlugin;
    const files = plugin.files;
    const md5s = plugin.md5s;
    const startCodepoint = plugin.options.startCodepoint;
    const property = plugin.options.property;
    const mergeDuplicates = plugin.options.mergeDuplicates;
    const reg = new RegExp(`${property}\\s*:\\s*url\\(["']?(.*?)["']?\\);`, 'g');

    const promises = [];
    // 由于是异步的，第一遍replace只用于查重
    source.replace(reg, (m, url) => {
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
            if (index < 0)
                result.add = true;
            return result;
        }));
    });

    if (promises.length > 0)
        plugin.shouldGenerate = true;
    const template = handlebars.compile(plugin.options.localCSSTemplate);
    Promise.all(promises).then((results) => {
        const contents = {};
        results.forEach((item) => {
            // const { url, add, file, md5Code } = item;
            const url = item.url;
            const add = item.add;
            const file = item.file;
            const md5Code = item.md5Code;

            let index = item.index;
            if (add) {
                files.push(file);
                if (mergeDuplicates)
                    md5s.push(md5Code);
                index = files.length - 1;
            }
            // save svg font code
            contents[url] = '\\' + (startCodepoint + index).toString(16);
        });
        return contents;
    }).then((contents) => {
        // 第二遍replace真正替换
        const result = source.replace(reg, (m, url) => template({
            fontName: plugin.options.fontName,
            content: contents[url],
        }));
        callback(null, result);
    }).catch((err) => {
        callback(err, source);
    });
}

iconFontLoader.Plugin = Plugin;

module.exports = iconFontLoader;
