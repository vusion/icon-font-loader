'use strict';

const crypto = require('crypto');
module.exports = {
    md5Create(stream) {
        const md5 = crypto.createHash('md5');
        md5.update(stream);
        return md5.digest('hex');
    },
};
