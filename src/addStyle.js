var iconFontStyle = require('./iconFontStyle.js');
var styleId = 'ICON-FONT-FILE-STYLE';

function createStyleContent(fontConfig) {
    var style = fontConfig || iconFontStyle.ICON_FONT_STYLE;
    return style.styleContent || '';
}

function addStyle(fontConfig) {
    var styleTag = document.createElement('style'), headElement = document.getElementsByTagName('head')[0];
    styleTag.innerHTML = createStyleContent(fontConfig);
    styleTag.id = styleId;
    styleTag.type = 'text/css';
    if (headElement) {
        headElement.appendChild(styleTag);
    } else {
        window.addEventListener('load', function () {
            headElement.appendChild(styleTag);
        });
    }
}

function updateStyle(fontConfig) {
    var styleTag = document.getElementById(styleId);
    if (!styleTag) {
        addStyle(fontConfig);
    } else {
        styleTag.innerHTML = createStyleContent(fontConfig);
    }
}
// if (!window.HAS_CREATE_FONT_STYLE) {
addStyle();
//     window.HAS_CREATE_FONT_STYLE = true;
// }
if (module.hot) {
    module.hot.accept('./iconFontStyle.js', function() {
        var newContent = require('./iconFontStyle.js');
        updateStyle(newContent.ICON_FONT_STYLE);
    });
}
