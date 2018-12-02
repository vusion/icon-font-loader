'use strict';

const fs = require('fs');
const path = require('path');
const webfontsGenerator = require('@vusion/webfonts-generator');
const utils = require('./utils');
const getAllModules = require('base-css-image-loader/src/getAllModules');
const { BasePlugin } = require('base-css-image-loader');

class IconFontPlugin extends BasePlugin {
    constructor(options) {
        options = options || {};
        super();

        this.NAMESPACE = 'IconFontPlugin';
        this.MODULE_MARK = 'isIconFontModule';
        this.REPLACE_REG = /ICON_FONT_LOADER_IMAGE\(([^)]*)\)/g;

        this.options = Object.assign(this.options, {
            // @inherit: output: './',
            // @inherit: filename: '[fontName].[ext]?[hash]',
            // @inherit: publicPath: undefined,
            property: 'icon-font',
            fontName: 'icon-font',
            types: ['ttf', 'eot', 'woff', 'svg'], // @bug: webfonts-generator
            localCSSTemplate: fs.readFileSync(path.resolve(__dirname, 'local.css.hbs'), 'utf8'),
            auto: true,
            dataURL: false,
            mergeDuplicates: false,
            startCodepoint: 0xF101,
        }, options);

        this.options.fontOptions = Object.assign({
            fontHeight: 1000,
        }, options.fontOptions);

        this.message = {};
        this.iconFontStylePath = '';
        this.data = {};
    }
    apply(compiler) {
        const addStylePath = path.resolve(__dirname, './addStyle.js');
        this.iconFontStylePath = path.resolve(__dirname, './iconFontStyle.js');

        this.plugin(compiler, 'environment', () => {
            if (this.options.auto)
                this.RUNTIME_MODULES = [addStylePath];
        });
        this.plugin(compiler, 'watchRun', (compiler, callback) => {
            this.watching = true;
            callback();
        });
        this.plugin(compiler, 'thisCompilation', (compilation, params) => {
            this.plugin(compilation, 'afterOptimizeChunks', (chunks) => this.afterOptimizeChunks(chunks, compilation));
            this.plugin(compilation, 'optimizeTree', (chunks, modules, callback) => this.optimizeTree(compilation, chunks, modules, callback));
            this.plugin(compilation, 'afterOptimizeTree', (modules) => this.afterOptimizeTree(compilation));
        });
        super.apply(compiler);
    }
    afterOptimizeChunks(chunks, compilation) {
        const startCodepoint = this.options.startCodepoint;

        // when watching, webpack module may be cached, so file list should be kept same as before.
        // if (!this.watching)
        //     this.fileSet.sort();
        const hashs = !this.watching ? Object.keys(this.data).sort() : Object.keys(this.data);
        hashs.forEach((key, index) => {
            const file = this.data[key];
            const codepoint = (startCodepoint + index).toString(16).slice(1);
            file.codepoint = codepoint;
            file.content = `'\\F${codepoint}'`;
            file.escapedContent = `\\'\\\\F${codepoint}\\'`;
        });
    }
    optimizeTree(compilation, chunks, modules, callback) {
        // If no icons collected, then do not generate fonts.
        if (!this.shouldGenerate)
            return callback();

        let files;
        try {
            if (!this.watching)
                files = Object.keys(this.data).sort().map((key) => this.data[key].filePath);
            else
                files = Object.keys(this.data).map((key) => this.data[key].filePath);
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

            const assets = compilation.assets;
            const font = { name: fontName };
            if (this.options.dataURL)
                font.woff = result.woff.toString('base64');
            else {
                types.forEach((type) => {
                    const output = this.getOutput({
                        name: fontName,
                        fontName,
                        ext: type,
                        content: result.svg,
                    }, compilation);

                    font[type] = { url: output.url };
                    assets[output.path] = {
                        source: () => result[type],
                        size: () => result[type].length,
                    };
                });
            }
            const styleContent = utils.createFontFace(font, this.options.dataURL);
            if (!this.options.auto) {
                // If auto is false, then emit a css file
                assets[path.join(this.options.output, `${fontName}.css`)] = {
                    source: () => styleContent,
                    size: () => styleContent.length,
                };
            }

            // Record message
            this.message.fontName = fontName;
            this.message.styleContent = styleContent;
            this.shouldGenerate = false;
            callback();
        });
    }
    afterOptimizeTree(compilation) {
        const allModules = getAllModules(compilation);
        allModules.filter((module) => module.userRequest === this.iconFontStylePath).forEach((module) => {
            const source = module._source;
            const result = `module.exports = {
    ICON_FONT_STYLE: ${JSON.stringify(this.message)},
}`;
            if (typeof source === 'string')
                module._source = result;
            else if (typeof source === 'object' && typeof source._value === 'string')
                source._value = result;
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
}

module.exports = IconFontPlugin;
