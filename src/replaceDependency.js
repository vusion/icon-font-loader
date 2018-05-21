const Dependency = require('webpack/lib/dependencies/NullDependency');
const path = require('path');

class ReplaceDependency extends Dependency {
    constructor(replaceRange) {
        super();
        this.replaceRange = replaceRange;
    }
    updateRange(range) {
        this.replaceRange = range;
    }
    updateHash(hash) {
        hash.update(this.replaceRange + '');
    }
}

ReplaceDependency.Template = {
    apply(dep, source, outputOptions, requestShortener) {
        const replaceRange = dep.replaceRange;
        for (const range of replaceRange)
            source.replace(range[0], range[1], range[2]);
    },
};

module.exports = ReplaceDependency;
