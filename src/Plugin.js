const path = require('path');
const webfontsGenerator = require('webfonts-generator');
const shell = require('shelljs');

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
        compiler.plugin('after-plugins', (compiler) => {
            compiler.options.iconFontOptions = {
                fontName: this.options.fontName,
                files: [],
                localCSSTemplate: this.options.localCSSTemplate,
            };
        });

        compiler.plugin('this-compilation', (compilation) => {
            this.tmpPath = path.resolve(__dirname, '../__tmp_' + Date.now());
            shell.mkdir(this.tmpPath);
            compiler.options.iconFontOptions.files = [];
        });

        // right after emit, files will be generated
        compiler.plugin('emit', (compilation, callback) => {
            const files = this.handleSameName(compiler.options.iconFontOptions.files);

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

                types.forEach((type) => {
                    assets[path.join(this.options.output, urls[type])] = {
                        source: () => result[type],
                        size: () => result[type].length,
                    };
                });
                assets[path.join(this.options.output, `${fontName}.css`)] = {
                    source: () => css,
                    size: () => css.length,
                };

                this.tmpPath && shell.rm('-r', path.resolve(__dirname, '../__tmp_*'));

                callback();
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
