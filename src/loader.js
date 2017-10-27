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
    const START_NUM = 0xF100; // webfonts-generator start at this number
    const property = plugin.options.property;
    const mergeDuplicates = plugin.options.mergeDuplicates;
    const reg = new RegExp(`${property}\\s*:\\s*url\\(["']?(.*?)["']?\\);`, 'g');

    const promises = [];
    const contents = {};
    // 由于是异步的，第一遍replace只用于查重
    source.replace(reg, (m, url) => {
        promises.push(new Promise((resolve, reject) => {
            // This path must be resolved by webpack.
            this.resolve(this.context, url, (err, result) => err ? reject(err) : resolve(result));
        }).then((file) => {
            this.addDependency(file);
            let md5Code, index;

            if (mergeDuplicates) {
                const filesContent = fs.readFileSync(file);
                md5Code = utils.md5Create(filesContent);
                index = md5s.indexOf(md5Code);
            } else
                index = files.indexOf(file);

            if (~index)
                index++;
            else {
                files.push(file);
                if (mergeDuplicates)
                    md5s.push(md5Code);
                index = files.length;
            }
            // 存储下每一个svg路径对应下的，字体编号
            contents[url] = '\\' + (START_NUM + index).toString(16);
            return file;
        }));
    });

    const template = handlebars.compile(plugin.options.localCSSTemplate);
    Promise.all(promises).then(() => {
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
