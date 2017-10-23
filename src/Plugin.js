'use strict';

const path = require('path');
const webfontsGenerator = require('webfonts-generator');
const shell = require('shelljs');
const webpack = require('webpack');
const ConcatSource = require('webpack-sources').ConcatSource;
const crypto = require('crypto');
const util = require('./util.js');

class IconFontPlugin {
    constructor(options) {
        this.options = Object.assign({
            property: 'icon-font',
            types: ['ttf', 'eot', 'woff', 'svg'], // @bug: webfonts-generator
            fontName: 'icon-font',
            output: './',
            localCSSTemplate: path.resolve(__dirname, 'local.css.hbs'),
            globalCSSTemplate: path.resolve(__dirname, 'global.css.hbs'),
            auto: true,
            mergeDuplicates: false,
        }, options);
    }

    apply(compiler) {
        const addStylePath = path.resolve(__dirname, './addStyle.js');
        const prefetchPlugin = new webpack.PrefetchPlugin(__dirname, './addStyle.js');
        const styleMessage = {};
        prefetchPlugin.apply(compiler);

        compiler.plugin('after-plugins', (compiler) => {
            this.files = [];
            this.md5s = [];

            shell.rm('-rf', path.resolve(__dirname, '../__tmp_*'));
            this.tmpPath = path.resolve(__dirname, '../__tmp_' + Date.now());
            shell.mkdir(this.tmpPath);
        });
        compiler.plugin('compilation', (compilation, params) => {
            compilation.plugin('normal-module-loader', (loaderContext) => {
                loaderContext.iconFontPlugin = this;
            });

            compilation.plugin('additional-assets', (callback) => {
                const files = this.handleSameName(this.files);
                if (!files.length)
                    return callback();
                const fontName = this.options.fontName;
                const types = this.options.types;
                webfontsGenerator({
                    files,
                    types,
                    fontName,
                    writeFiles: false,
                    dest: 'build', // Required but doesn't get used
                    fontHeight: 1000,
                    cssTemplate: this.options.globalCSSTemplate,
                }, (err, result) => {
                    if (err)
                        return callback(err);

                    const urls = {};
                    types.forEach((type) => urls[type] = `${fontName}.${type}`);
                    const css = result.generateCss();

                    const assets = compilation.assets;
                    styleMessage.fontName = fontName;
                    types.forEach((type) => {
                        const filePath = path.join(this.options.output, urls[type]);
                        let url = path.join(compilation.options.output.publicPath || '', urls[type]);
                        if (path.sep === '\\')
                            url = url.replace(/\\/g, '/');
                        styleMessage[type] = {
                            url,
                            hash: util.md5Create(result[type]),
                        };
                        assets[filePath] = {
                            source: () => result[type],
                            size: () => result[type].length,
                        };
                    });
                    if (!this.options.auto) {
                        // auto is false and emit a css file
                        assets[path.join(this.options.output, `${fontName}.css`)] = {
                            source: () => css,
                            size: () => css.length,
                        };
                    }
                    callback();
                });
            });

            if (!this.options.auto)
                return;
            //if insert @font-face auto
            compilation.plugin('optimize-chunks', (chunks) => {
                const addStyleModule = compilation.modules.find((module) => module.request === addStylePath);
                if (addStyleModule) {
                    chunks.forEach((chunk) => {
                        chunk.addModule(addStyleModule);
                        addStyleModule.addChunk(chunk);
                    });
                }
            });

            compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
                chunks.forEach((chunk) => {
                    chunk.files.forEach((file) => {
                        if (file.endsWith('.js')) {
                            compilation.assets[file] = new ConcatSource(
                                `/* icon font style message */
                                if (typeof window !== "undefined" && !window.ICON_FONT_STYLE) {
                                    window.ICON_FONT_STYLE = ${JSON.stringify(styleMessage)};
                                } else if (typeof window !== "undefined" && window.ICON_FONT_STYLE && window.ICON_FONT_STYLE.update) {
                                    window.ICON_FONT_STYLE.update(${JSON.stringify(styleMessage)});
                                }`,
                                compilation.assets[file]
                            );
                        }
                    });
                });
                callback();
            });
            compilation.mainTemplate.plugin('startup', (source, chunk, hash) => {
                let id = -1;
                chunk.forEachModule((module) => {
                    if (module.request === addStylePath)
                        id = module.id;
                });
                if (id !== -1) {
                    return [
                        ` __webpack_require__(${id})()`,
                    ].join('\n') + source;
                }
                return source;
            });
        });
    }

    handleSameName(files) {
        const names = {};
        const result = [];

        const getUniqueName = (name) => {
            let num = 1;
            while (names[`${name}-${num}`])
                num++;
            return `${name}-${num}`;
        };

        files.forEach((file) => {
            let name = path.basename(file, '.svg');

            if (names[name]) {
                name = getUniqueName(name);
                const newFile = path.join(this.tmpPath, name + '.svg');
                shell.cp(file, newFile);
                file = newFile;
            }

            names[name] = true;
            result.push(file);
        });

        return result;
    }
}

module.exports = IconFontPlugin;
