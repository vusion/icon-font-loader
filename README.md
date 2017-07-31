# icon-font-loader

Transform icon-font CSS property and generate font files automaticaly.

## Install

```
npm install --save-dev icon-font-loader
```

## Example

``` css
.head:after {
    icon-font: url('../icons/arrow-down.svg');
}
```

will be transformed to

``` css
.head:after {
    font-family: 'IconFont';
    font-style: normal;
    font-weight: normal;
    ...
    content: '\f106';
}
```

(eot,svg,ttf,woff) fonts, and a global `@font-face` file imported automaticaly.

## Usage
