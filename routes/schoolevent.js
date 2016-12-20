'use strict';

const joi = require('joi');
const mongoose = require('mongoose');
const config = require('config');
const School = mongoose.model('school');
const Event = mongoose.model('schoolevent');

let createEvent = {
    path: '/api/events',
    method: 'POST',
    config: {
        description: 'create an event',
        notes: 'This takes an array of _id\'s of schools',
        tags: ['api', 'event'],
        validate: {
            payload: {
                name: joi.string().required(),
                schools: joi.array().required(),
                isEnabled: joi.boolean(),
                fromDate: joi.date().required(),
                toDate: joi.date().required()
            }
        },
        handler: function (request, reply) {
            let newEvent = new Event(request.payload);
            newEvent._schools = request.payload.schools;
            newEvent.save(err => {
                if (err) {
                    request.log(['error', 'db'], err.stack);
                    return reply({ success: false, message: err.message, result: null }).code(500);
                } else {
                    School.update({ _id: { $in: newEvent._schools } }, { $set: { $push: { _events: newEvent._id } } }, (err, school) => {
                        if (err) {
                            request.log(['error', 'db'], err.stack);
                            return reply({ success: false, message: err.message, result: null }).code(500);
                        } else {
                            return reply({ success: true, message: 'Event created!', result: newEvent }).code(201);
                        }
                    });
                }
            });
        }
    }
};

let updateEvent = {
    path: '/api/events/{id}',
    method: 'POST',
    config: {
        description: 'update an event',
        notes: 'This takes an array of _id\'s of schools',
        tags: ['api', 'event'],
        validate: {
            params: {
                id: joi.string().required()
            },
            payload: {
                name: joi.string(),
                schools: joi.array(),
                isEnabled: joi.boolean(),
                fromDate: joi.date(),
                toDate: joi.date()
            }
        },
        handler: function (request, reply) {
            if (request.payload.schools) {
                request.payload._schools = request.payload.schools;
            }
            Event.findByIdAndUpdate(request.params.id, request.payload, { new: true }, (err, event) => {
                if (err) {
                    request.log(['error', 'db'], err.stack);
                    return reply({ success: false, message: err.message, result: null }).code(500);
                } else {
                    return reply({ success: true, message: 'Event updated!', result: event }).code(200);
                }
            });
        }
    }
};

let getEvents = {
    path: '/api/events',
    method: 'GET',
    config: {
        description: 'Get all events',
        tags: ['api', 'events'],
        handler: function (request, reply) {
            Event.find({}, (err, events) => {
                if (err) {
                    request.log(['error', 'db'], err.stack);
                    return reply({ success: false, message: err.message, result: null }).code(500);
                } else {
                    return reply({ success: true, message: 'Got events!', result: events }).code(200);
                }
            });
        }
    }
};

module.exports = [createEvent, updateEvent, getEvents];