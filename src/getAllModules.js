'use strict';

let ConcatenatedModule;
try {
    ConcatenatedModule = require('webpack/lib/optimize/ConcatenatedModule');
} catch (e) { }

function getAllModules(compilation) {
    let modules = compilation.modules;
    if (compilation.children.length > 0) {
        const childModules = compilation.children.map(getAllModules)
            .reduce((acc, compilationModules) => acc.concat(compilationModules), []);

        modules = modules.concat(childModules);
    }
    if (ConcatenatedModule) {
        const concatenatedModules = modules.filter((m) => (m instanceof ConcatenatedModule)).reduce((acc, m) => {
            const subModules = 'modules' in m ? m.modules : m._orderedConcatenationList.map((entry) => entry.module);
            return acc.concat(subModules);
        }, []);
        if (concatenatedModules.length > 0) {
            modules = modules.concat(concatenatedModules);
        }
    }
    return modules;
}
module.exports = getAllModules;
