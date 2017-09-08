/**
 * Created by moujintao on 2017/8/30.
 */
const createStyleContent = () => {
    const style = window.ICON_FONT_STYLE,
        fontName = style.name;
    let   srcStr = [];

    for(const name of Object.keys(style)){
        const path  = style[name].path,hash = style[name].md5;
        switch (name) {
            case 'eot':
                srcStr.push(`url("${path}?${hash}#iefix") format("embedded-opentype")`);
                break;
            case 'woff':
                srcStr.push(`url("${path}?${hash}") format("woff")`);
                break;
            case 'ttf':
                srcStr.push(`url("${path}?${hash}") format("truetype")`);
                break;
            case 'svg':
                srcStr.push(`url("${path}?${hash}#${fontName}") format("svg")`);
            default:
                break;

        }
    }
    srcStr = srcStr.join(",");
    return `@font-face {
                    font-family: "${fontName}";
                    src: ${srcStr};
                }`;
}

const addStyle = () => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = createStyleContent();
    const headElement  = document.getElementsByTagName('head')[0];
    styleTag.type="text/css";
    if(headElement){
        headElement.appendChild(styleTag);
    }else{
        window.addEventListener('load',() => {
            headElement.appendChild(styleTag);
        })
    }
}


module.exports= (hash) => {
    if(window.HAS_CREATE_FONT_STYLE){
        return;
    }
    addStyle();
    window.HAS_CREATE_FONT_STYLE = true;
}
console.log(module.hot);