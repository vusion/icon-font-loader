'use strict';

const { utils } = require('base-css-image-loader');

utils.createFontFace = function createFontFace(font, dataURL) {
    let output = [];
    if (dataURL) {
        const base64 = font.woff;
        output = `url('data:application/x-font-woff;base64,${base64}') format('woff')`;
    } else {
        Object.keys(font).forEach((type) => {
            const url = font[type].url;
            if (type === 'eot')
                output.push(`url('${url}#iefix') format('embedded-opentype')`);
            else if (type === 'woff')
                output.push(`url('${url}') format('woff')`);
            else if (type === 'ttf')
                output.push(`url('${url}') format('truetype')`);
            else if (type === 'svg')
                output.push(`url('${url}#${font.name}') format('svg')`);
        });
        output = output.join(',\n    ');
    }
    return `@font-face {
    font-family: '${font.name}';
    src: ${output};
}`;
};

module.exports = utils;
