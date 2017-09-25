'use strict';

const path = require('path');
const webfontsGenerator = require('webfonts-generator');
const shell = require('shelljs');
const webpack = require('webpack');
const ConcatSource = require('webpack-sources').ConcatSource;
const crypto = require('crypto');

class IconFontPlugin {
    constructor(options) {
        this.options = Object.assign({
            types: ['ttf', 'eot', 'woff', 'svg'], // @bug: webfonts-generator
            fontName: 'icon-font',
            output: './',
            localCSSTemplate: path.resolve(__dirname, 'local.css.hbs'),
            globalCSSTemplate: path.resolve(__dirname, 'global.css.hbs'),
        }, options);
    }

    apply(compiler) {
        const addStylePath = path.resolve(__dirname, './addStyle.js');
        const prefetchPlugin = new webpack.PrefetchPlugin(__dirname, './addStyle.js');
        const styleMessage = {};
        prefetchPlugin.apply(compiler);

        compiler.plugin('after-plugins', (compiler) => {
            this.files = [];

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
                    styleMessage.name = fontName;
                    types.forEach((type) => {
                        const pathFile = path.join(this.options.output, urls[type]);
                        styleMessage[type] = {
                            path: this.options.publicPath ? path.join(this.options.publicPath, urls[type]) : path.join(compilation.options.output.publicPath, urls[type]),
                            md5: this.md5Create(result[type]),
                        };
                        assets[pathFile] = {
                            source: () => result[type],
                            size: () => result[type].length,
                        };
                    });
                    assets[path.join(this.options.output, `${fontName}.css`)] = {
                        source: () => css,
                        size: () => css.length,
                    };

                    callback();
                });
            });
            compilation.plugin('optimize-chunks', (chunks) => {
                const modules = compilation.modules;
                let addStyleModule;
                modules.forEach((module) => {
                    if (module.request === addStylePath)
                        addStyleModule = module;
                });
                chunks.forEach((chunk) => {
                    chunk.addModule(addStyleModule);
                    addStyleModule.addChunk(chunk);
                });
            });
            compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
                chunks.forEach((chunk) => {
                    chunk.files.forEach((file) => {
                        compilation.assets[file] = new ConcatSource(
                            '/**icon font style message**/',
                            '\n',
                            'if(window&&!window.ICON_FONT_STYLE){',
                            `window.ICON_FONT_STYLE = ${JSON.stringify(styleMessage)};}`,
                            'else if(window.ICON_FONT_STYLE&&window.ICON_FONT_STYLE.update){',
                            `window.ICON_FONT_STYLE.update(${JSON.stringify(styleMessage)})`,
                            '}',
                            compilation.assets[file]);
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
    md5Create(stream) {
        const md5 = crypto.createHash('md5');
        md5.update(stream);
        return md5.digest('hex');
    }
}

module.exports = IconFontPlugin;
