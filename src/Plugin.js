'use strict';

const path = require('path');
const fs = require('fs');
const webfontsGenerator = require('@vusion/webfonts-generator');
const utils = require('./utils');
const getAllModules = require('./getAllModules');
const replaceReg = /ICON_FONT_LOADER_IMAGE\(([^)]*)\)/g;
const NAMESPACE = 'IconFontPlugin';
const BasePlugin = require('base-css-image-loader').plugin({
    NAMESPACE,
    MODULEMARK: 'IconFontSVGModule',
    REPLACEREG: replaceReg,
});

class IconFontPlugin {
    constructor(options) {
        this.options = Object.assign({
            property: 'icon-font',
            types: ['ttf', 'eot', 'woff', 'svg'], // @bug: webfonts-generator
            fontName: 'icon-font',
            output: './',
            localCSSTemplate: fs.readFileSync(path.resolve(__dirname, 'local.css.hbs'), 'utf8'),
            auto: true,
            dataURL: false,
            mergeDuplicates: false,
            startCodepoint: 0xF101,
            fontOptions: {
                fontHeight: 1000,
            },
            filename: '[fontName].[ext]?[hash]',
            publicPath: undefined,
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
        BasePlugin.plugin(compiler, 'environment', () => this.environmentCallback(compiler, entryCallBack));
        BasePlugin.plugin(compiler, 'afterPlugins', (compiler) => this.afterPluginCallBack());
        BasePlugin.plugin(compiler, 'watchRun', (compiler, callback) => {
            this.watching = true;
            callback();
        });
        BasePlugin.plugin(compiler, 'thisCompilation', (compilation, params) => {
            BasePlugin.plugin(compilation, 'afterOptimizeChunks', (chunks) => this.afterOptimizeChunks(chunks, compilation));
            BasePlugin.plugin(compilation, 'optimizeExtractedChunks', (chunks) => this.optimizeExtractedChunks(chunks));
            BasePlugin.plugin(compilation, 'optimizeTree', (chunks, modules, callback) => this.optimizeTree(compilation, chunks, modules, callback));
            BasePlugin.plugin(compilation, 'afterOptimizeTree', (modules) => this.afterOptimizeTree(compilation));
        });
        BasePlugin.plugin(compiler, 'compilation', (compilation, params) => {
            BasePlugin.plugin(compilation, 'normalModuleLoader', (loaderContext, module) => this.normalModuleLoader(loaderContext, module));
        });
        BasePlugin.apply(compiler);
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
        BasePlugin.data = this.getFontData(this.fontCodePoints);
    }
    optimizeExtractedChunks() {
        BasePlugin.data = this.getFontData(this.fontCodePoints);
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
        const filename = this.options.filename;
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

            const assets = compilation.assets;
            const font = { name: fontName };
            if (this.options.dataURL) {
                font.woff = result.woff.toString('base64');
            } else {
                types.forEach((type) => {
                    // const hash = utils.md5Create(result[type]);
                    const fileName = utils.createFileName(filename, {
                        name: fontName, fontName, ext: type, content: result.svg,
                    });
                    const filePath = path.join(this.options.output, fileName);
                    const urlPath = this.options.auto ? this.options.output : '';
                    let url = '/';
                    if (this.options.publicPath)
                        url = utils.urlResolve(this.options.publicPath, fileName);
                    else
                        url = utils.urlResolve(compilation.options.output.publicPath || '', path.join(urlPath, fileName));
                    if (path.sep === '\\')
                        url = url.replace(/\\/g, '/');
                    font[type] = {
                        url,
                        // hash,
                    };
                    assets[filePath] = {
                        source: () => result[type],
                        size: () => result[type].length,
                    };
                });
            }
            const css = utils.createFontFace(font, this.options.dataURL);
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
        allModules.filter((module) => module.userRequest === this.iconFontStylePath).forEach((module) => {
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
    getFontDataStr(fontCodePoints) {
        const data = {};
        for (const name of Object.keys(fontCodePoints)) {
            const code = '\\F' + fontCodePoints[name];
            data[name] = code;
        }
        return data;
    }
    getFontData(fontCodePoints) {
        const data = {};
        for (const name of Object.keys(fontCodePoints)) {
            const code = '\\\\F' + fontCodePoints[name];
            const content = `\\"${code}\\"`;
            data[name] = content;
        }
        return data;
    }
    pickFileList() {
        const startCodepoint = this.options.startCodepoint;
        const filesMap = {};
        for (const file of this.files)
            filesMap[file.file] = file.md5Code;
        if (this.watching) {
            // if webpack is watching and maybe will use webpack module cache, so file list should be same as before
            this.filesToFont = Array.from(new Set(this.files.map((file) => file.file)));
        } else {
            this.filesToFont = Array.from(new Set(this.files.map((file) => file.file))).sort();
        }
        this.fontCodePoints = {};
        this.filesToFont.forEach((file, index) => {
            const md5Code = filesMap[file];
            const codePoint = (startCodepoint + index).toString(16).slice(1);
            this.fontCodePoints[md5Code] = codePoint;
        });
    }
}

module.exports = IconFontPlugin;
