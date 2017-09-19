/**
 * test attribute function in plugin Object
 */
const shell = require('shelljs');
const path = require('path');
const Plugin = require('../src/Plugin.js');
const IconFontPlugin = new Plugin();
const expect = require('chai').expect;

shell.rm('-rf', path.resolve(__dirname, './__test_tmp_*'));
IconFontPlugin.tmpPath = path.resolve(__dirname, './__test_tmp_' + Date.now());
shell.mkdir(IconFontPlugin.tmpPath);

describe('icon font plugin api test:', () => {
    it('#function handleSameName file list none same test: ', (done) => {
        const files = [
            path.resolve(__dirname, '/icons/arrow-left.svg'),
            path.resolve(__dirname, '/icons/arrow-right.svg'),
            path.resolve(__dirname, '/icons/arrow-up.svg'),
        ];
        const result = IconFontPlugin.handleSameName(files);
        expect(result).to.eql(files);
        done();
    });
    it('#function handleSameName file list have same name test: ', (done) => {
        const files = [
            path.resolve(__dirname, './icons/arrow-left.svg'),
            path.resolve(__dirname, './icons/same-name/arrow-left.svg'),
            path.resolve(__dirname, './icons/arrow-right.svg'),
            path.resolve(__dirname, './icons/arrow-up.svg'),
        ];
        const result = IconFontPlugin.handleSameName(files);
        expect(result).to.eql([
            path.resolve(__dirname, './icons/arrow-left.svg'),
            IconFontPlugin.tmpPath + '/arrow-left-1.svg',
            path.resolve(__dirname, './icons/arrow-right.svg'),
            path.resolve(__dirname, './icons/arrow-up.svg'),
        ]);
        done();
    });
});
