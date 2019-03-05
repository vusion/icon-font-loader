'use strict';

const { utils } = require('base-css-image-loader');

utils.createFontFace = function createFontFace(font, dataURL) {
    let src = [];
    if (dataURL) {
        const base64 = font.woff;
        src = [`url('data:application/x-font-woff;base64,${base64}') format('woff')`];
    } else {
        Object.keys(font).forEach((type) => {
            const url = font[type].url;
            if (type === 'eot')
                src.push(`url('${url}#iefix') format('embedded-opentype')`);
            else if (type === 'woff')
                src.push(`url('${url}') format('woff')`);
            else if (type === 'ttf')
                src.push(`url('${url}') format('truetype')`);
            else if (type === 'svg')
                src.push(`url('${url}#${font.name}') format('svg')`);
        });
    }

    return {
        fontName: font.name,
        src,
        content: `@font-face {
            font-family: '${font.name}';
            src: ${src.join(',\n    ')};
        }`,
    };
};

module.exports = utils;
