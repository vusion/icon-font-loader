/**
 * test attribute function in plugin Object
 */
const fs = require('fs');
const path = require('path');
const Plugin = require('../src/Plugin.js');
const utils = require('../src/utils.js');
const IconFontPlugin = new Plugin();
const expect = require('chai').expect;

describe('icon font plugin api test:', () => {
    it('#function handleSameName file list none same test: ', (done) => {
        const files = [
            path.resolve(__dirname, './icons/arrow-left.svg'),
            path.resolve(__dirname, './icons/arrow-right.svg'),
            path.resolve(__dirname, './icons/arrow-up.svg'),
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
        const file = result[1];
        // file.metadata = { name: 'arrow-left-1' };
        if (!(file instanceof fs.ReadStream))
            throw new Error('don\'t create a ReadStream for same name svg file');
        expect(result).to.eql([
            path.resolve(__dirname, './icons/arrow-left.svg'),
            file,
            path.resolve(__dirname, './icons/arrow-right.svg'),
            path.resolve(__dirname, './icons/arrow-up.svg'),
        ]);
        done();
    });
    it('#function resolve url test: ', (done) => {
        const urlList = [
            ['http://nos.163.com/cloud/public', '/font/icon-font.eot', 'http://nos.163.com/font/icon-font.eot'],
            ['http://nos.163.com/cloud/public', 'font/icon-font.eot', 'http://nos.163.com/cloud/public/font/icon-font.eot'],
            ['http://nos.163.com/cloud/public/', 'font/icon-font.eot', 'http://nos.163.com/cloud/public/font/icon-font.eot'],
            ['/public/', 'font/icon-font.eot', '/public/font/icon-font.eot'],
            ['/public/', '../font/icon-font.eot', '/font/icon-font.eot'],
            ['/public/', '/font/icon-font.eot', '/font/icon-font.eot'],
            ['/public', 'font/icon-font.eot', '/public/font/icon-font.eot'],
            ['/public', '/font/icon-font.eot', '/font/icon-font.eot'],
            ['public', 'font/icon-font.eot', 'public/font/icon-font.eot'],
            ['public', '/font/icon-font.eot', '/font/icon-font.eot'],
            ['public/', 'font/icon-font.eot', 'public/font/icon-font.eot'],
            ['public/', '/font/icon-font.eot', '/font/icon-font.eot'],
            ['', 'font/icon-font.eot', 'font/icon-font.eot'],
            ['.', 'font/icon-font.eot', 'font/icon-font.eot'],
        ];
        urlList.forEach((urls) => {
            const resultEql = urls[2];
            const result = utils.urlResolve(urls[0], urls[1]);
            expect(result).to.eql(resultEql);
        });
        done();
    });
});
