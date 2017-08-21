const fs = require('fs');
const handlebars = require('handlebars');

const Plugin = require('./Plugin');
const reg = /icon-font\s*:\s*url\(["']?(.*?)["']?\);/g;

function iconFontLoader(source) {
    const callback = this.async();

    this.cacheable();
    const options = this._compiler.options.iconFontOptions;
    const files = options.files;
    const START_NUM = 256; // webfonts-generator start at this number

    const promises = [];
    const contents = [];
    let i = 0;
    // 由于是异步的，第一遍replace只用于查重
    source.replace(reg, (m, $1) => {
        promises.push(new Promise((resolve, reject) => {
            // This path must be resolved.
            this.resolve(this.context, $1, (err, result) => err ? reject(err) : resolve(result));
        }).then((file) => {
            this.addDependency(file);
            let index = files.indexOf(file);
            if (~index)
                index++;
            else {
                files.push(file);
                index = files.length;
            }
            contents[i++] = '\\f' + (START_NUM + index).toString(16);
            return file;
        }));
    });

    const template = handlebars.compile(fs.readFileSync(options.localCSSTemplate, 'utf8'));
    Promise.all(promises).then(() => {
        // 第二遍replace真正替换
        let i = 0;
        const result = source.replace(reg, (m, $1) => template({
            fontName: options.fontName,
            content: contents[i++],
        }));
        callback(null, result);
    }).catch((err) => {
        callback(err, source);
    });
}

iconFontLoader.Plugin = Plugin;

module.exports = iconFontLoader;
