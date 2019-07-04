module.exports = {
    PLUGIN_NAME: 'iconFontPlugin',
    MODULE_MARK: 'isIconFontModule',
    REPLACER_NAME: 'ICON_FONT_LOADER_IMAGE',
    REPLACER_RE: /ICON_FONT_LOADER_IMAGE\(([^)]*)\)/g,
    PATHMAP_CHANGED_FLAG: Symbol('PATHMAP_CHANGED_FLAG'),
};
