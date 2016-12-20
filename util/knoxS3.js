'use strict';
var config = require('config');
var knox = require('knox');

const client = knox.createClient({
    key: config.s3config.accessKey,
    secret: config.s3config.secretKey,
    bucket: config.s3config.bucket,
    region: config.s3config.region
});

module.exports = client;