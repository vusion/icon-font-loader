/**
 * Created by moujintao on 2017/6/8.
 */

const path = require('path');
const fs = require('fs');

module.exports = {
    rmdirSync: (function () {
        function iterator(url, dirs) {
            const stat = fs.statSync(url);
            if (stat.isDirectory()) {
                dirs.unshift(url);// 收集目录
                inner(url, dirs);
            } else if (stat.isFile())
                fs.unlinkSync(url);// 直接删除文件
        }
        function inner(path, dirs) {
            const arr = fs.readdirSync(path);
            for (let i = 0, el; el = arr[i++];)
                iterator(path + '/' + el, dirs);
        }
        return function (dir, cb) {
            cb = cb || function () {};
            const dirs = [];

            try {
                iterator(dir, dirs);
                for (var i = 0, el; el = dirs[i++];)
                    fs.rmdirSync(el);// 一次性删除所有收集到的目录

                cb();
            } catch (e) { // 如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
                e.code === 'ENOENT' ? cb() : cb(e);
            }
        };
    })(),
    readAllIconSvg(entryList, runPath) {
        let files = [], jsPath, dirs, matchs, entery;

        for (let i = 0, len = entryList.length; i < len; i++) {
            entery = entryList[i];
            jsPath = path.join(runPath, entery);
            dirs = fs.readdirSync(jsPath);
            matchs = [];
            dirs.forEach((item) => {
                matchs = item.match(/(.+)\.svg$/);
                if (matchs)
                    files.push(path.resolve(jsPath, item));
            });
        }
        return files;
    },

    mkdir(dirpath, dirname) {
    // 判断是否是第一次调用
        if (typeof dirname === 'undefined') {
            if (fs.existsSync(dirpath)) {

            } else
                this.mkdir(dirpath, path.dirname(dirpath));
        } else {
            // 判断第二个参数是否正常，避免调用时传入错误参数
            if (dirname !== path.dirname(dirpath)) {
                this.mkdir(dirpath);
                return;
            }
            if (fs.existsSync(dirname))
                fs.mkdirSync(dirpath);
            else {
                this.mkdir(dirname, path.dirname(dirname));
                fs.mkdirSync(dirpath);
            }
        }
    },

    delRepeat(arry) {
        arry.sort();// 排序
        const n = [arry[0]];
        for (let i = 1; i < arry.length; i++) {
            if (arry[i] !== n[n.length - 1])
                n.push(arry[i]);
        }
        return n;
    },

    getRepeatClassNameSvg(arry) {
        let n = [], nameList = [], svgList = [], result = {};

        arry.forEach((value) => {
            this.delRepeatName(value, result);
        });
        return result;
    },
    delRepeatName(value, result) {
        let filePath = value.split('/'), fileName = filePath[filePath.length - 1], names = fileName.split('.');
        const name = names.slice(0, names.length - 1).join('');
        if (result[name] === undefined) {
            result[name] = [];
            result[name].push(value);
            return 0;
        } else {
            if (result[name].indexOf(value) > -1)
                return result[name].indexOf(value);
            else {
                result[name].push(value);
                return result.length - 1;
            }
        }
    },
    createFileCache(svgList, svgNames, cachePath) {
        const svgs = [];
        this.mkdir(cachePath);
        for (let i = 0, len = svgList.length; i < len; i++) {
            const name = svgNames[i];
            let newPath = svgList[i];
            if (name.index !== 0) {
                newPath = cachePath + '/' + svgNames[i].name + '.svg';
                this.copy(svgList[i], newPath);
            }
            svgs.push(newPath);
        }
        return svgs;
        // for(let name of Object.keys(classNames)){
        //     if(classNames[name].length==1){
        //         list.push(classNames[name][0]);
        //     }else{
        //         classNames[name].forEach((val,index)=>{
        //                 let suffix="",newPath;
        //                 if(index!==0){
        //                     suffix=index;
        //                     newPath=cachePath+"/"+name+"-"+suffix+".svg";
        //                 }else{
        //                     newPath=cachePath+"/"+name+".svg";
        //                 }
        //
        //                 this.copy(val,newPath);
        //                 hasCache=true;
        //                 list.push(newPath);
        //         });
        //     }
        // }

        return {
            svgList: list,
            hasCache,
        };
    },
    getOutputPath(output, rootPath) {
        let fontDirName, htmlDirName, cssDirName;
        if (output instanceof Object) {
            fontDirName = output.font;
            htmlDirName = output.html || output.font;
            cssDirName = output.css || output.font;
        } else if (typeof output === 'string') {
            fontDirName = output;
            htmlDirName = output;
            cssDirName = output;
        }
        return {
            fontDirName: path.join(rootPath, fontDirName),
            htmlDirName: path.join(rootPath, htmlDirName),
            cssDirName: path.join(rootPath, cssDirName),
        };
    },
    copy(src, dst) {
        fs.writeFileSync(dst, fs.readFileSync(src));
    },
};
