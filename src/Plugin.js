'use strict';

const path = require('path');
const fs = require('fs');
const webfontsGenerator = require('vusion-webfonts-generator');
const webpack = require('webpack');
const ConcatSource = require('webpack-sources').ConcatSource;
const utils = require('./utils');
const ReplaceSource = require('webpack-sources').ReplaceSource;
const getAllModules = require('./getAllModules');

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
            fontOptions: {
                fontHeight: 1000,
            },
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
        });

        compiler.plugin('this-compilation', (compilation, params) => {
            compilation.plugin('after-optimize-chunks', (chunks) => {
                const startCodepoint = this.options.startCodepoint;
                const replaceReg = /ICON_FONT_LOADER_IMAGE\(([^)]*)\)/g;
                this.files = Array.from(new Set(this.files)).sort();
                this.fontCodePoints = {};
                this.files.forEach((file, index) => {
                    const codePoint = (startCodepoint + index).toString(16).slice(1);
                    this.fontCodePoints[file] = codePoint;
                });
                const fontCodePoints = this.fontCodePoints;
                getAllModules(compilation).forEach((module) => {
                    const source = module._source;
                    if (typeof source === 'string') {
                        module._source = this.replaceHolder(source, replaceReg, fontCodePoints);
                    } else if (typeof source === 'object' && typeof source._value === 'string') {
                        source._value = this.replaceHolder(source._value, replaceReg, fontCodePoints);
                    }
                });
            });
            compilation.plugin('additional-assets', (callback) => {
                // If loader doesn't collect icons, then don't generate fonts.
                if (!this.shouldGenerate)
                    return callback();

                let files;
                try {
                    files = this.files;
                    files = this.handleSameName(files);
                } catch (e) {
                    return callback(e);
                }
                if (!files.length)
                    return callback();

                const fontName = this.options.fontName;
                const types = this.options.types;
                const fontOptions = this.options.fontOptions;
                const startCodepoint = this.options.startCodepoint;
                webfontsGenerator(Object.assign({
                    files,
                    types,
                    fontName,
                    writeFiles: false,
                    dest: 'build', // Required but not used
                    startCodepoint,
                }, fontOptions), (err, result) => {
                    if (err)
                        return callback(err);
                    const urls = {};
                    types.forEach((type) => urls[type] = `${fontName}.${type}`);

                    const assets = compilation.assets;
                    const font = { name: fontName };
                    types.forEach((type) => {
                        const filePath = path.join(this.options.output, urls[type]);
                        const urlPath = this.options.auto ? this.options.output : '';
                        let url = path.join(compilation.options.output.publicPath || '', urlPath, urls[type]);
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
                    this.shouldGenerate = false;
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
                    // someTime id is not a number
                    // if you use NamedMoudlesPlugin or HashMoudlesPlugin id will be a path string or hash String
                    if (typeof id === 'number') {
                        return [
                            ` __webpack_require__(${id})()`,
                        ].join('\n') + source;
                    } else {
                        return [
                            ` __webpack_require__('${id}')()`,
                        ].join('\n') + source;
                    }
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
                file = fs.createReadStream(file);
                name = getUniqueName(name);
                file.metadata = { name };
            }

            names[name] = true;
            result.push(file);
        });

        return result;
    }
    replaceHolder(value, replaceReg, fontCodePoints) {
        return value.replace(replaceReg, ($1, $2) => {
            if (fontCodePoints[$2]) {
                const code = String.fromCharCode(parseInt('F' + fontCodePoints[$2], 16));
                return `'${code}'`;
            } else
                return $1;
        });
    }
}

module.exports = IconFontPlugin;
