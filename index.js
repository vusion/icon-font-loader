const regExp = /icon-font\s*:\s*url\(([\s\S]*)\);/g;
const path = require('path');
function iconFontLoader(source) {
    const iconFontOptions = this._compilation.options.iconFontOptions;
    const svgList = this._compilation.options.iconFontOptions.svgList;
    return source.replace(regExp, ($1, $2) => {
        if ($2.includes('"'))
            $2 = $2.replace(/"/g, '');
        if ($2.includes('\''))
            $2 = $2.replace(/'/g, '');
        const url = path.resolve(this.context, $2);
        svgList.push(url);
        return 'display: inline-block;\nfont-family: "' + iconFontOptions.fontName + '";\nfont-style: normal;\nfont-weight: normal;\nfont-variant: normal;\nline-height: 1;\ntext-decoration: inherit;\ntext-rendering: optimizeLegibility;\ntext-transform: none;\n-moz-osx-font-smoothing: grayscale;\n-webkit-font-smoothing: antialiased;\nfont-smoothing: antialiased;\nvertical-align: middle;\nmargin-bottom: 2px;\ncontent: "${ICONFONT_' + url + '}";';
    });
};
module.exports = iconFontLoader;
