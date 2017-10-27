'use strict';

const crypto = require('crypto');
module.exports = {
    md5Create(stream) {
        const md5 = crypto.createHash('md5');
        md5.update(stream);
        return md5.digest('hex');
    },
    createFontFace(font) {
        let srcStr = [];
        const svgHash = font.svg.hash;

        for (const type in font) {
            const url = font[type].url;
            // const hash = font[type].hash;
            if (font.hasOwnProperty(type)) {
                switch (type) {
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
                        srcStr.push('url("' + url + '?' + svgHash + '#' + font.name + '") format("svg")');
                        break;
                    default:
                        break;
                }
            }
        }
        srcStr = srcStr.join(',\n\t');
        return `@font-face {\n\tfont-family: "${font.name}";\n\tsrc:${srcStr};\n}`;
    },
};
