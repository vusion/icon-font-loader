/** ****/ (function (modules) { // webpackBootstrap
/** ****/ 	// The module cache
/** ****/ 	const installedModules = {};
    /** ****/
    /** ****/ 	// The require function
    /** ****/ 	function __webpack_require__(moduleId) {
        /** ****/
        /** ****/ 		// Check if module is in cache
        /** ****/ 		if (installedModules[moduleId]) {
            /** ****/ 			return installedModules[moduleId].exports;
            /** ****/ 		}
        /** ****/ 		// Create a new module (and put it into the cache)
        /** ****/ 		const module = installedModules[moduleId] = {
            /** ****/ 			i: moduleId,
            /** ****/ 			l: false,
            /** ****/ 			exports: {},
            /** ****/ 		};
        /** ****/
        /** ****/ 		// Execute the module function
        /** ****/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        /** ****/
        /** ****/ 		// Flag the module as loaded
        /** ****/ 		module.l = true;
        /** ****/
        /** ****/ 		// Return the exports of the module
        /** ****/ 		return module.exports;
        /** ****/ 	}
    /** ****/
    /** ****/
    /** ****/ 	// expose the modules object (__webpack_modules__)
    /** ****/ 	__webpack_require__.m = modules;
    /** ****/
    /** ****/ 	// expose the module cache
    /** ****/ 	__webpack_require__.c = installedModules;
    /** ****/
    /** ****/ 	// define getter function for harmony exports
    /** ****/ 	__webpack_require__.d = function (exports, name, getter) {
        /** ****/ 		if (!__webpack_require__.o(exports, name)) {
            /** ****/ 			Object.defineProperty(exports, name, {
                /** ****/ 				configurable: false,
                /** ****/ 				enumerable: true,
                /** ****/ 				get: getter,
                /** ****/ 			});
            /** ****/ 		}
        /** ****/ 	};
    /** ****/
    /** ****/ 	// getDefaultExport function for compatibility with non-harmony modules
    /** ****/ 	__webpack_require__.n = function (module) {
        /** ****/ 		const getter = module && module.__esModule
        /** ****/ 			? function getDefault() { return module.default; }
        /** ****/ 			: function getModuleExports() { return module; };
        /** ****/ 		__webpack_require__.d(getter, 'a', getter);
        /** ****/ 		return getter;
        /** ****/ 	};
    /** ****/
    /** ****/ 	// Object.prototype.hasOwnProperty.call
    /** ****/ 	__webpack_require__.o = function (object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
    /** ****/
    /** ****/ 	// __webpack_public_path__
    /** ****/ 	__webpack_require__.p = '/';
    /** ****/
    /** ****/ 	// Load entry module and return exports
    /** ****/ 	return __webpack_require__(__webpack_require__.s = 0);
/** ****/ })
/** **********************************************************************/
/** ****/ ([
/* 0 */
/** */ (function (module, exports, __webpack_require__) {
        __webpack_require__(1);
        module.exports = __webpack_require__(3);
        /** */ }),
    /* 1 */
    /** */ (function (module, __webpack_exports__, __webpack_require__) {
        'use strict';

        Object.defineProperty(__webpack_exports__, '__esModule', { value: true });
        /* harmony import */ const __WEBPACK_IMPORTED_MODULE_0__iconFontStyle_js__ = __webpack_require__(2);
        /* harmony import */ const __WEBPACK_IMPORTED_MODULE_0__iconFontStyle_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__iconFontStyle_js__);

        const styleId = 'ICON-FONT-FILE-STYLE';

        function createStyleContent(fontConfig) {
            const style = fontConfig || __WEBPACK_IMPORTED_MODULE_0__iconFontStyle_js___default.a.ICON_FONT_STYLE;
            return style.styleContent || '';
        }

        function addStyle(fontConfig) {
            let styleTag = document.createElement('style'), headElement = document.getElementsByTagName('head')[0];
            styleTag.innerHTML = createStyleContent(fontConfig);
            styleTag.id = styleId;
            styleTag.type = 'text/css';
            if (headElement) {
                headElement.appendChild(styleTag);
            } else {
                window.addEventListener('load', () => {
                    headElement.appendChild(styleTag);
                });
            }
        }

        function updateStyle(fontConfig) {
            const styleTag = document.getElementById(styleId);
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
        if (false) {
            module.hot.accept('./iconFontStyle.js', () => {
                const newContent = require('./iconFontStyle.js');
                updateStyle(newContent.ICON_FONT_STYLE);
            });
        }
        /** */ }),
    /* 2 */
    /** */ (function (module, exports) {
        module.exports = {
            ICON_FONT_STYLE: { fontName: 'icon-font', styleContent: '@font-face {\n\tfont-family: "icon-font";\n\tsrc:url("dest/icon-font.ttf?65710e1596abed7a7320ad764713d11d") format("truetype"),\n\turl("dest/icon-font.eot?65710e1596abed7a7320ad764713d11d#iefix") format("embedded-opentype"),\n\turl("dest/icon-font.woff?65710e1596abed7a7320ad764713d11d") format("woff"),\n\turl("dest/icon-font.svg?65710e1596abed7a7320ad764713d11d#icon-font") format("svg");\n}' },
        };
        /** */ }),
    /* 3 */
    /** */ (function (module, __webpack_exports__, __webpack_require__) {
        'use strict';

        Object.defineProperty(__webpack_exports__, '__esModule', { value: true });
        /* harmony import */ const __WEBPACK_IMPORTED_MODULE_0__icon_css__ = __webpack_require__(4);
        /* harmony import */ const __WEBPACK_IMPORTED_MODULE_0__icon_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__icon_css__);
        /* harmony import */ const __WEBPACK_IMPORTED_MODULE_1__icon1_css__ = __webpack_require__(5);
        /* harmony import */ const __WEBPACK_IMPORTED_MODULE_1__icon1_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__icon1_css__);
        /** */ }),
    /* 4 */
    /** */ (function (module, exports) {

        // removed by extract-text-webpack-plugin

        /** */ }),
    /* 5 */
    /** */ (function (module, exports) {

        // removed by extract-text-webpack-plugin

        /** */ }),
/** ****/ ]);
