const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const Plugin = require('./Plugin');
const regExp = /icon-font\s*:\s*url\(["']?(.*?)["']?\);/g;

function iconFontLoader(source) {
    this.cacheable();
    const options = this._compilation.options.iconFontOptions;
    const files = options.files;
    const START_NUM = 256; // webfonts-generator start at this number

    const result = source.replace(regExp, (m, $1) => {
        const svgPath = path.resolve(this.context, $1);
        if (!fs.existsSync(svgPath))
            return m;

        let index = files.indexOf(svgPath);
        if (~index)
            index++;
        else {
            files.push(svgPath);
            index = files.length;
        }
        index = START_NUM + index;
        const content = '\\f' + index.toString(16);

        const template = fs.readFileSync(options.localCSSTemplate, 'utf8');
        return handlebars.compile(template)({
            fontName: options.fontName,
            content,
        });
    });

    return result;
}

iconFontLoader.Plugin = Plugin;

module.exports = iconFontLoader;
