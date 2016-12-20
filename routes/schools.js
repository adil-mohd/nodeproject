'use strict';

const joi = require('joi');
const mongoose = require('mongoose');
const config = require('config');
const School = mongoose.model('school');

let createSchool = {
    path: '/api/schools',
    method: 'POST',
    config: {
        description: 'Create a School',
        tags: ['api', 'school'],
        validate: {
            payload: {
                name: joi.string().required(),
                description: joi.string(),
                code: joi.string().required(),
                address: joi.string().required()
            }
        },
        handler: function (request, reply) {
            School.findOne({ $or: [{ name: request.payload.name }, { code: request.payload.code }] }, (err, school) => {
                if (err) {
                    request.log(['error'], err.stack);
                    return reply(err);
                } else if (school) {
                    return reply('School with name/code already exists!').code(409);
                } else {
                    let newSchool = new School(request.payload);
                    newSchool.save((err) => {
                        if (err) {
                            request.log(['error'], err.stack);
                            return reply(err);
                        } else {
                            return reply(newSchool).code(201);
                        }
                    });
                }
            });
        }
    }
};

let getSchools = {
    path: '/api/schools',
    method: 'GET',
    config: {
        description: 'Get schools',
        tags: ['api', 'school'],
        handler: function (request, reply) {
            School.find({}, (err, schools) => {
                if (err) {
                    request.log(['error'], err.stack);
                    return reply(err);
                } else {
                    return reply(schools).code(200);
                }
            });
        }
    }
};

let updateSchool = {
    path: '/api/schools/{id}',
    method: 'PUT',
    config: {
        description: 'Update a school',
        tags: ['api', 'school'],
        validate: {
            params: {
                id: joi.string().required()
            },
            payload: {
                name: joi.string(),
                description: joi.string(),
                address: joi.string()
            }
        },
        handler: function (request, reply) {
            School.findByIdAndUpdate(request.params.id, request.payload, { new: true }, (err, school) => {
                if (err) {
                    request.log(['error'], err.stack);
                    return reply(err);
                } else {
                    return reply(school).code(200);
                }
            });
        }
    }
};

let getASchoolEvents = {
    path: '/api/schools/{id}',
    method: 'GET',
    config: {
        description: 'GET a school with events populated',
        tags: ['api', 'school'],
        validate: {
            params: {
                id: joi.string().required()
            }
        },
        handler: function (request, reply) {
            School.findById(request.params.id).populate('_events').exec((err, school) => {
                if (err) {
                    request.log(['error', 'db'], err.stack);
                    return reply({ success: false, message: err.message, result: null }).code(500);
                } else if (school) {
                    return reply({ success: true, message: 'Found school', result: school }).code(200);
                } else {
                    return reply({ success: false, message: 'School not found!', result: null }).code(400);
                }
            });
        }
    }
};

module.exports = [createSchool, getSchools, updateSchool, getASchoolEvents];