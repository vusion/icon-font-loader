'use strict';

const crypto = require('crypto');
module.exports = {
    md5Create(stream) {
        const md5 = crypto.createHash('md5');
        md5.update(stream);
        return md5.digest('hex');
    },
    createCssStyle(fontConfig) {
        const style = fontConfig;
        const fontName = style.fontName;
        let srcStr = [];
        const svgHash = style['svg'].hash;

        for (const name in style) {
            const url = style[name].url;
            const hash = style[name].hash;
            if (style.hasOwnProperty(name)) {
                switch (name) {
                    case 'eot':
                        srcStr.push('url("' + url + '?' + svgHash + '#iefix") format("embedded-opentype")');
                        break;
                    case 'woff':
                        srcStr.push('url("' + url + '?' + svgHash + '") format("woff")');
                        break;
                    case 'ttf':
                        srcStr.push('url("' + url + '?' + svgHash + '") format("truetype")');
                        break;
                    case 'svg':
                        srcStr.push('url("' + url + '?' + svgHash + '#' + fontName + '") format("svg")');
                        break;
                    default:
                        break;
                }
            }
        }
        srcStr = srcStr.join(',\n\t');
        return `@font-face {\n\tfont-family: "${fontName}";\n\tsrc:${srcStr};\n}`;
    },
};
