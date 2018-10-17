'use strict';

const postcss = require('postcss');
const postcssPlugin = require('./postcssPlugin');

const Plugin = require('./Plugin');

// function getNextLoader(loader) {
//     const loaders = loader.loaders;
//     const previousRequest = loader.previousRequest;
//     const loaderContexts = loaders.map((loader) => loader.normalExecuted);
//     const index = loaderContexts.lastIndexOf(false);
//     const nextLoader = loaders[index].normal;
//     return nextLoader;
// }
function iconFontLoader(source, meta) {
    const callback = this.async();
    this.cacheable();
    const options = {
        to: this.resourcePath,
        from: this.resourcePath,
    };
    if (meta && meta.sourceRoot && meta.mappings) {
        options.map = {
            prev: meta,
            inline: false,
            annotation: false,
        };
    }

    postcss([postcssPlugin({ loaderContext: this })]).process(source, options).then((result) => {
        const map = result.map && result.map.toJSON();
        callback(null, result.css, map);
        return null;
    }).catch((error) => {
        callback(error);
    });
}

iconFontLoader.Plugin = Plugin;

iconFontLoader.acceptPostCssAst = true;

module.exports = iconFontLoader;
