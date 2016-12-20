'use strict';

const joi = require('joi');
const s3client = require('../util/knoxS3');
const fs = require('fs');
const moment = require('moment');
const config = require('config');
const client = require('../util/s3client');

let upload = {
    path: '/api/schools/{id}/date/{date}/students/{studentid}/upload',
    method: 'POST',
    config: {
        description: 'Upload a file/image',
        tags: ['api', 'upload', 'image'],
        notes: 'Student uploads an image. School id and the date of upload in format DDMMYYYY (12082016) and student\'s roll no.',
        plugins: {
            'hapi-swagger': {
                payloadType: 'form'
            }
        },
        validate: {
            params: {
                id: joi.string().required(),
                date: joi.string().required(),
                studentid: joi.string().required()
            },
            payload: {
                file: joi.any()
                    .meta({
                        swaggerType: 'file'
                    })
                    .description('image')
            }
        },
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data',
            maxBytes: config.server.maxBytes
        },
        handler: function (request, reply) {
            var data = request.payload;
            if (data.file) {
                var name = data.file.hapi.filename;
                var path = '/tmp/' + name;
                var file = fs.createWriteStream(path);
                file.on('error', function (err) {
                    request.log(['error'], err.stack);
                    return reply({ success: false, message: err.message, result: null }).code(500);
                });

                var re = /(?:\.([^.]+))?$/;
                var extension = re.exec(name)[1];//name.slice((dokument.name.lastIndexOf(".") - 1 >>> 0) + 2);
                if (extension && extension.length > 0) {
                    extension = '.' + extension;
                } else {
                    extension = '';
                }

                var key = request.params.id + '/' + request.params.date + '/' + request.params.studentid + extension;

                file.on('close', function (err) {
                    if (err) {
                        request.log(['error'], err.stack);
                        return reply(err);
                    }
                    s3client.putFile(path, key, {
                        'x-amz-acl': 'public-read'
                    }, function (err, res) {
                        if (err) {
                            fs.unlink(path, function (err) {
                                if (err) {
                                    request.log(['error'], err.stack);
                                }
                            });
                            request.log(['error'], 'Error in uploading file: ', err.stack);
                            return reply(err);
                        } else {
                            //request.log(['info'], 'Response: ' + JSON.stringify(res));
                            if (res.statusCode !== 200) {
                                fs.unlink(path, function (err) {
                                    if (err) {
                                        request.log(['error'], err.stack);
                                    }
                                });
                                err = new Error('Unable to upload to s3: ' + res.statusCode);
                                return reply(err);
                            } else {
                                fs.unlink(path);
                                request.log(['info'], 'Upload successful!');
                                return reply(res.socket._httpMessage.url).code(200);
                            }
                        }
                    });
                });

                data.file.pipe(file);
            }
        }
    }
};



let s3upload = {
    path: '/api/schools/{id}/date/{date}/students/{studentid}/upload',
    method: 'POST',
    config: {
        description: 'Upload a file/image',
        tags: ['api', 'upload', 'image'],
        notes: 'Student uploads an image. School id and the date of upload in format DDMMYYYY (12082016) and student\'s roll no.',
        plugins: {
            'hapi-swagger': {
                payloadType: 'form'
            }
        },
        validate: {
            params: {
                id: joi.string().required(),
                date: joi.string().required(),
                studentid: joi.string().required()
            },
            payload: {
                file: joi.any()
                    .meta({
                        swaggerType: 'file'
                    })
                    .description('image')
            }
        },
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data',
            maxBytes: config.server.maxBytes
        },
        handler: function (request, reply) {
            var data = request.payload;
            if (data.file) {
                var name = data.file.hapi.filename;
                var path = '/tmp/' + name;
                var file = fs.createWriteStream(path);
                file.on('error', function (err) {
                    request.log(['error'], err.stack);
                    return reply({ success: false, message: err.message, result: null }).code(500);
                });

                var re = /(?:\.([^.]+))?$/;
                var extension = re.exec(name)[1];//name.slice((dokument.name.lastIndexOf(".") - 1 >>> 0) + 2);
                if (extension && extension.length > 0) {
                    extension = '.' + extension;
                } else {
                    extension = '';
                }

                var key = request.params.id + '/' + request.params.date + '/' + request.params.studentid + extension;

                file.on('close', function (err) {
                    if (err) {
                        request.log(['error'], err.stack);
                        return reply(err);
                    } else {
                        var params = {
                            localFile: path,

                            s3Params: {
                                Bucket: config.s3config.bucket,
                                Key: key,
                                // other options supported by putObject, except Body and ContentLength.
                                // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
                            },
                        };
                        var uploader = client.uploadFile(params);
                        uploader.on('error', function (err) {
                            console.error("unable to upload:", err.stack);
                            return reply(err);
                        });
                        uploader.on('progress', function () {
                            console.log("progress", uploader.progressMd5Amount,
                                uploader.progressAmount, uploader.progressTotal);
                        });
                        uploader.on('end', function () {
                            console.log("done uploading");
                            return reply(client.getPublicUrlHttp(config.s3config.bucket, key)).code(200);
                        });
                    }
                });
                data.file.pipe(file);
            }
        }
    }
};

module.exports = upload;