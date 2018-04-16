'use strict';

const path = require('path');
const fs = require('fs');
const webfontsGenerator = require('vusion-webfonts-generator');
const webpack = require('webpack');
const ConcatSource = require('webpack-sources').ConcatSource;
const utils = require('./utils');
const ReplaceSource = require('webpack-sources').ReplaceSource;
const getAllModules = require('./getAllModules');
const replaceReg = /ICON_FONT_LOADER_IMAGE\(([^)]*)\)/g;
const NAMESPACE = 'IconFontPlugin';

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
        this.context = '';
        this.styleMessage = {};
        this.iconFontStylePath = '';
    }

    apply(compiler) {
        const addStylePath = path.resolve(__dirname, './addStyle.js');
        this.iconFontStylePath = path.resolve(__dirname, './iconFontStyle.js');
        this.styleMessage = {};

        function entryCallBack(entry) {
            function addStyleModuleToEntry(entry) {
                let result;
                if (typeof entry === 'string') {
                    result = [addStylePath, entry];
                } else if (Array.isArray(entry)) {
                    entry.unshift(addStylePath);
                    result = entry;
                }
                return result;
            }
            if (typeof entry === 'string' || Array.isArray(entry)) {
                return addStyleModuleToEntry(entry);
            } else if (typeof entry === 'object') {
                const result = {};
                for (const name of Object.keys(entry)) {
                    result[name] = addStyleModuleToEntry(entry[name]);
                }
                return result;
            }
        }
        if (compiler.hooks) {
            compiler.hooks.environment.tap(NAMESPACE, () => this.environmentCallback(compiler, entryCallBack));
            compiler.hooks.afterPlugins.tap(NAMESPACE, (compiler) => this.afterPluginCallBack());
            compiler.hooks.thisCompilation.tap(NAMESPACE, (compilation, params) => {
                compilation.hooks.afterOptimizeChunks.tap(NAMESPACE, (chunks) => this.afterOptimizeChunks(chunks, compilation));
                compilation.hooks.optimizeExtractedChunks.tap(NAMESPACE, (chunks) => this.optimizeExtractedChunks(chunks));
                compilation.hooks.optimizeTree.tap(NAMESPACE, (chunks, modules, callback) => this.optimizeTree(compilation, chunks, modules, callback));
                compilation.hooks.afterOptimizeTree.tap(NAMESPACE, (modules) => this.afterOptimizeTree(compilation));
            });
            compiler.hooks.compilation.tap(NAMESPACE, (compilation, params) => {
                compilation.hooks.normalModuleLoader.tap(NAMESPACE, (loaderContext, module) => this.normalModuleLoader(loaderContext, module));
            });
        } else {
            compiler.plugin('environment', () => this.environmentCallback(compiler, entryCallBack));

            compiler.plugin('after-plugins', (compiler) => this.afterPluginCallBack());

            compiler.plugin('this-compilation', (compilation, params) => {
                compilation.plugin('after-optimize-chunks', (chunks) => this.afterOptimizeChunks(chunks, compilation));
                compilation.plugin('optimize-extracted-chunks', (chunks) => this.optimizeExtractedChunks(chunks));
                compilation.plugin('optimize-tree', (chunks, modules, callback) => this.optimizeTree(compilation, chunks, modules, callback));
                compilation.plugin('after-optimize-tree', (modules) => this.afterOptimizeTree(compilation));
            });
            compiler.plugin('compilation', (compilation, params) => {
                compilation.plugin('normal-module-loader', (loaderContext, module) => this.normalModuleLoader(loaderContext, module));
            });
        }
    }
    environmentCallback(compiler, entryCallBack) {
        const entry = compiler.options.entry;
        if (this.options.auto) {
            if (typeof entry === 'string' || Array.isArray(entry)) {
                compiler.options.entry = entryCallBack(entry);
            } else if (typeof entry === 'object') {
                compiler.options.entry = entryCallBack(entry);
            } else if (typeof entry === 'function') {
                compiler.options.entry = function () {
                    return Promise.resolve(entry()).then((entry) => entryCallBack(entry));
                };
            }
        }
    }
    afterPluginCallBack() {
        this.files = [];
        this.md5s = [];
        this.filesToFont = [];
        this.fontCodePoints = {};
    }
    normalModuleLoader(loaderContext, module) {
        loaderContext.iconFontPlugin = this;
    }
    afterOptimizeChunks(chunks, compilation) {
        this.pickFileList();
        const fontCodePoints = this.fontCodePoints;
        const allModules = getAllModules(compilation);
        allModules.filter((module) => module.IconFontSVGModule).forEach((module) => {
            const source = module._source;
            if (typeof source === 'string') {
                module._source = this.replaceHolder(source, replaceReg, fontCodePoints);
            } else if (typeof source === 'object' && typeof source._value === 'string') {
                source._value = this.replaceHolder(source._value, replaceReg, fontCodePoints);
            }
        });
    }
    optimizeExtractedChunks(chunks) {
        const fontCodePoints = this.fontCodePoints;
        chunks.forEach((chunk) => {
            const modules = !chunk.mapModules ? chunk._modules : chunk.mapModules();
            modules.filter((module) => '_originalModule' in module).forEach((module) => {
                const source = module._source;
                if (typeof source === 'string') {
                    module._source = this.replaceHolder(source, replaceReg, fontCodePoints);
                } else if (typeof source === 'object' && typeof source._value === 'string') {
                    source._value = this.replaceHolder(source._value, replaceReg, fontCodePoints);
                }
            });
        });
    }
    optimizeTree(compilation, chunks, modules, callback) {
        // If loader doesn't collect icons, then don't generate fonts.
        if (!this.shouldGenerate)
            return callback();

        let files;
        try {
            files = this.filesToFont;
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
            this.styleMessage.fontName = fontName;
            this.styleMessage.styleContent = css;
            this.shouldGenerate = false;
            callback();
        });
    }
    afterOptimizeTree(compilation) {
        const allModules = getAllModules(compilation);
        allModules.filter((module) => module.request === this.iconFontStylePath).forEach((module) => {
            const source = module._source;
            if (typeof source === 'string') {
                module._source = ['module.exports = {',
                    `ICON_FONT_STYLE: ${JSON.stringify(this.styleMessage)}`,
                    '}'].join('\n');
            } else if (typeof source === 'object' && typeof source._value === 'string') {
                source._value = ['module.exports = {',
                    `ICON_FONT_STYLE: ${JSON.stringify(this.styleMessage)}`,
                    '}'].join('\n');
            }
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
    pickFileList() {
        const startCodepoint = this.options.startCodepoint;
        const filesMap = {};
        for (const file of this.files)
            filesMap[file.file] = file.md5Code;
        this.filesToFont = Array.from(new Set(this.files.map((file) => file.file))).sort();
        this.fontCodePoints = {};
        this.filesToFont.forEach((file, index) => {
            const md5Code = filesMap[file];
            const codePoint = (startCodepoint + index).toString(16).slice(1);
            this.fontCodePoints[md5Code] = codePoint;
        });
    }
}

module.exports = IconFontPlugin;
