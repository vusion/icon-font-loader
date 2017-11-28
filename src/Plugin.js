'use strict';

const path = require('path');
const fs = require('fs');
const webfontsGenerator = require('webfonts-generator');
const shell = require('shelljs');
const webpack = require('webpack');
const ConcatSource = require('webpack-sources').ConcatSource;
const utils = require('./utils');

class IconFontPlugin {
    constructor(options) {
        this.options = Object.assign({
            property: 'icon-font',
            types: ['ttf', 'eot', 'woff', 'svg'], // @bug: webfonts-generator
            fontName: 'icon-font',
            output: './',
            localCSSTemplate: fs.readFileSync(path.resolve(__dirname, 'local.css.hbs'), 'utf8'),
            auto: true,
            mergeDuplicates: false,
            startCodepoint: 0xF101,
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
        compiler.plugin('this-compilation', (compilation, params) => {
            compilation.plugin('additional-assets', (callback) => {
                const flag = this.flag;
                if (!flag)
                    return callback();
                const files = this.handleSameName(this.files);
                if (!files.length)
                    return callback();
                const fontName = this.options.fontName;
                const types = this.options.types;
                const startCodepoint = this.options.startCodepoint;

                webfontsGenerator({
                    files,
                    types,
                    fontName,
                    writeFiles: false,
                    dest: 'build', // Required but not used
                    fontHeight: 1000,
                    startCodepoint,
                }, (err, result) => {
                    if (err)
                        return callback(err);

                    const urls = {};
                    types.forEach((type) => urls[type] = `${fontName}.${type}`);

                    const assets = compilation.assets;
                    const font = { name: fontName };
                    types.forEach((type) => {
                        const filePath = path.join(this.options.output, urls[type]);
                        let url = path.join(compilation.options.output.publicPath || '', this.options.output, urls[type]);
                        if (path.sep === '\\')
                            url = url.replace(/\\/g, '/');
                        font[type] = {
                            url,
                            hash: utils.md5Create(result[type]),
                        };
                        assets[filePath] = {
                            source: () => result[type],
                            size: () => result[type].length,
                        };
                    });
                    const css = utils.createFontFace(font);
                    if (!this.options.auto) {
                        // auto is false and emit a css file
                        assets[path.join(this.options.output, `${fontName}.css`)] = {
                            source: () => css,
                            size: () => css.length,
                        };
                    }
                    // save font name and style content
                    styleMessage.fontName = fontName;
                    styleMessage.styleContent = css;
                    this.flag = false;
                    callback();
                });
            });

            if (!this.options.auto)
                return;
            // if insert @font-face auto
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
                            // add icon font message in chunk file
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
        compiler.plugin('compilation', (compilation, params) => {
            compilation.plugin('normal-module-loader', (loaderContext) => {
                loaderContext.iconFontPlugin = this;
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
            if (!fs.existsSync(file))
                file = path.resolve(__dirname, 'empty.svg');
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
