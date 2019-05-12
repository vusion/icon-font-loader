'use strict';

const fs = require('fs');
const path = require('path');
const webfontsGenerator = require('@vusion/webfonts-generator');
const utils = require('./utils');
const { BasePlugin } = require('base-css-image-loader');
const meta = require('./meta');

class IconFontPlugin extends BasePlugin {
    constructor(options) {
        options = options || {};
        super();
        Object.assign(this, meta);

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

        this.fontFacePath = '';
        this.data = {}; // { [id]: { id, filePath, url } }
    }
    apply(compiler) {
        this.fontFacePath = path.resolve(__dirname, './fontface.css');
        this.plugin(compiler, 'environment', () => {
            if (this.options.auto)
                this.RUNTIME_MODULES.push(this.fontFacePath);
        });
        this.plugin(compiler, 'watchRun', (compiler, callback) => {
            this.watching = true;
            callback();
        });
        this.plugin(compiler, 'thisCompilation', (compilation, params) => {
            this.plugin(compilation, 'afterOptimizeChunks', (chunks) => this.afterOptimizeChunks(chunks, compilation));
            this.plugin(compilation, 'optimizeTree', (chunks, modules, callback) => this.optimizeTree(compilation, chunks, modules, callback));
            this.plugin(compilation, 'afterOptimizeTree', (chunks, modules) => {
                this.changeReplaceForAfterOptimizeTree();
                this.replaceInModules(chunks, compilation);
            });
            this.plugin(compilation, 'optimizeChunkAssets', (chunks, callback) => {
                // Assets source is different from module source, so set escapedContent to content.
                if (this.data.src)
                    this.data.src.escapedContent = this.data.src.content;
                this.replaceInCSSAssets(chunks, compilation);
                callback();
            });
        });
        super.apply(compiler);
    }
    afterOptimizeChunks(chunks, compilation) {
        // Reset meta data
        Object.assign(this, meta);

        const startCodepoint = this.options.startCodepoint;
        // When watching, webpack module may be cached, so file list should be kept same as before.
        const keys = Object.keys(this.data);
        !this.watching && keys.sort(); // Make sure same cachebuster in uncertain file loaded order
        keys.forEach((key, index) => {
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
            const keys = Object.keys(this.data);
            !this.watching && keys.sort(); // Make sure same cachebuster in uncertain file loaded order
            files = keys.map((key) => this.data[key].filePath);
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

            const fontFace = utils.createFontFace(font, this.options.dataURL);
            if (!this.options.auto) {
                // If auto is false, then emit a css file
                assets[path.join(this.options.output, `${fontName}.css`)] = {
                    source: () => fontFace.content,
                    size: () => fontFace.content.length,
                };
            }

            // Change replace data
            this.fontFace = fontFace;
            this.shouldGenerate = false;
            callback();
        });
    }
    changeReplaceForAfterOptimizeTree() {
        const fontFace = this.fontFace;
        if (!fontFace)
            return;

        this.data.fontName = {
            content: fontFace.fontName,
            escapedContent: fontFace.fontName,
        };
        this.data.src = {
            content: fontFace.src.join(',\n    '),
            escapedContent: fontFace.src.join(',\\n    '),
        };
        this.REPLACER_RE = /ICON_FONT_LOADER_FONTFACE\(([^)]*)\)/g;
        this.MODULE_MARK = 'isFontFaceModule';
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
