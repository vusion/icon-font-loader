/**
 * Created by moujintao on 2017/5/12.
 */
const path = require('path');
const fs = require('fs');
const IconMaker = require('icon-maker');
const iconMaker = new IconMaker();
const runPath = path.resolve('./');
const ejs = require('ejs');
const util = require('./util.js');

const fileNamePath = {};

class fontIconCreatePlugin {
    constructor(options) {
        this.options = Object.assign({
            output: '/src/iconFont',
            name: 'iconFont',
            styleTemplate: __dirname + '/demo.css',
            htmlTemplate: __dirname + '/i-font-preview.html',
            publishPath: './',
            cssEmbed: false,
        }, options);
        this.options.loaderName = 'vusion-iconmaker';
        this.iconUrlNameMap = {};
    }
    apply(compiler) {
        const { fontDirName } = util.getOutputPath(this.options.output, compiler.options.output.path);
        this.fontDirName = fontDirName;
        compiler.plugin('after-plugins', (compiler) => {
            compiler.options.iconFontOptions = {
                fontName: this.options.name,
                svgList: [],
                stratNum: 256,
            };
        });
        compiler.plugin('this-compilation', (compilation) => {
            compilation.options.iconFontOptions.svgList = [];
        });
        // right after emit, files will be generated
        compiler.plugin('emit', (compilation, callback) => {
            const iconFontLoaderSvgs = compilation.options.iconFontOptions.svgList;
            const svgList = this.handleCache(iconFontLoaderSvgs);
            iconMaker._svgs = [];
            svgList.forEach((value) => {
                // if(iconMaker._svgs.indexOf(value) === -1){
                iconMaker.addSvg(value);
                // }
            });
            iconMaker._fontFamily = this.options.name;
            iconMaker.run((err, font) => {
                if (err)
                    throw err;
                const fontFiles = font.fontFiles;
                const assets = compilation.assets;
                const fontSavePath = this.options.output.font || this.options.output;
                const cssSavePath = this.options.output.css || this.options.output;
                const htmlSavePath = this.options.output.html || this.options.output;

                for (let n = 0, len = fontFiles.length; n < len; n++) {
                    assets[fontSavePath + fontFiles[n].path] = {
                        source() {
                            return fontFiles[n].contents;
                        },
                        size() {
                            return fontFiles[n].contents.length;
                        },
                    };
                }
                this.handleCss(font, compilation.hash).then((options) => {
                    this.fonts = options.data.fontName;
                    assets[cssSavePath + '/' + this.options.name + '.css'] = {
                        source() {
                            return options.result;
                        },
                        size() {
                            return options.result.length;
                        },
                    };
                    return options;
                }).then(() => {
                    util.rmdirSync(fontDirName + '/SAME_SVG_CACHE');
                    callback();
                }).catch((err) => {
                    util.rmdirSync(fontDirName + '/SAME_SVG_CACHE');
                    throw err;
                });
            });
        });
    }
    handleCss(font, hash) {
        const iconMakerCss = font.css;
        const data = this.extractVar(iconMakerCss);
        data.hash = hash;
        return new Promise((res, rej) => {
            fs.readFile(this.options.styleTemplate, (err, fileData) => {
                if (err)
                    throw err;
                const template = fileData.toString();
                const result = template.replace(/\$\{([0-9a-zA-Z]*)\}/g, (e1, e2) => {
                    const replaceVal = data[e2] || e1;
                    return replaceVal;
                });
                res({ result, data });
            });
        });
    }
    extractVar(css) {
        const name = this.options.name,
            publishPath = this.options.publishPath,
            classReg = new RegExp('\\.' + name + '-([0-9a-zA-Z-]*)\\:before\\s*\\{\\n\\s*content\\:\\s*\\"(\\\\f[0-9a-zA-Z]*)\\"\\;\\s*\\n\\s*\\}', 'g'),
            fontBody = [], fontName = {};
        let regResult = classReg.exec(css);
        while (regResult) {
            fontBody.push(regResult[0]);
            fontName[regResult[1]] = regResult[2];
            regResult = classReg.exec(css);
        }
        return {
            name,
            publishPath,
            fontContent: fontBody.join('\n'),
            fontName,
        };
    }
    handleCache(svgList) {
        let svgNames = this.getSvgNames(svgList);
        const list = {};
        svgNames = svgNames.map((item, index) => {
            if (list[item]) {
                list[item].push(svgList[index]);
                return { name: item + '-' + list[item].length, index: list[item].length };
            } else {
                list[item] = [svgList[index]];
                return { name: item, index: 0 };
            }
        });
        return util.createFileCache(svgList, svgNames, this.fontDirName + '/SAME_SVG_CACHE');
    }
    getSvgNames(list) {
        return list.map((item) => item.substring(item.lastIndexOf('/') + 1, item.lastIndexOf('.')));
    }
}

module.exports = fontIconCreatePlugin;
