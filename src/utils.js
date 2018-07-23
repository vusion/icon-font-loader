'use strict';

const crypto = require('crypto');
const url = require('url');
const path = require('path');

module.exports = {
    md5Create(stream) {
        const md5 = crypto.createHash('md5');
        md5.update(stream);
        return md5.digest('hex');
    },
    createFontFace(font, isDataUrl) {
        let srcStr = [];
        if (isDataUrl) {
            const base64 = font.woff;
            srcStr = `url("data:application/x-font-woff;base64,${base64}") format("woff")`;
        } else {
            const svgHash = font.svg.hash;
            for (const type in font) {
                const url = font[type].url;
                // const hash = font[type].hash;
                if (font.hasOwnProperty(type)) {
                    switch (type) {
                        case 'eot':
                            srcStr.push('url("' + url + '#iefix") format("embedded-opentype")');
                            break;
                        case 'woff':
                            srcStr.push('url("' + url + '") format("woff")');
                            break;
                        case 'ttf':
                            srcStr.push('url("' + url + '") format("truetype")');
                            break;
                        case 'svg':
                            srcStr.push('url("' + url + '#' + font.name + '") format("svg")');
                            break;
                        default:
                            break;
                    }
                }
            }
            srcStr = srcStr.join(',\n\t');
        }
        return `@font-face {\n\tfont-family: "${font.name}";\n\tsrc:${srcStr};\n}`;
    },
    urlResolve(base, urlPath) {
        if (path.sep === '\\')
            urlPath = urlPath.replace(/\\/g, '/');
        if (base && base[base.length - 1] !== '/')
            base = base + '/';
        return url.resolve(base, urlPath);
    },
    createFileName(placeholder, data) {
        return placeholder.replace(/\[([^[]*)\]/g, ($1, $2) => data[$2] || $1);
    },
};
