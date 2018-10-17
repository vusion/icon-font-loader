'use strict';

const fs = require('fs');
const handlebars = require('handlebars');
const utils = require('./utils');
const postcss = require('postcss');
const path = require('path');
const postcssPlugin = require('./postcssPlugin');

const Plugin = require('./Plugin');

function getNextLoader(loader) {
    const loaders = loader.loaders;
    const previousRequest = loader.previousRequest;
    const loaderContexts = loaders.map((loader) => loader.normalExecuted);
    const index = loaderContexts.lastIndexOf(false);
    const nextLoader = loaders[index].normal;
    return nextLoader;
}
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
        // if (result.messages) {
        //     result.messages.forEach(({ type, file }) => {
        //       if (type === 'dependency') {
        //         this.addDependency(file)
        //       }
        //     })
        //   }
        //   const map = result.map && result.map.toJSON()
        //   cb(null, result.css, map)
        //   return null // silence bluebird warning
        // })
    }).catch((error) => {
        console.log(error);
    });
}

iconFontLoader.Plugin = Plugin;

iconFontLoader.acceptPostCssAst = true;

module.exports = iconFontLoader;
