'use strict';

const joi = require('joi');
const mongoose = require('mongoose');
const config = require('config');
const School = mongoose.model('school');
const Post = mongoose.model('responses');

let createPost = {
    path: '/api/schools/{id}/posts',
    method: 'POST',
    config: {
        description: 'Create a Post',
        tags: ['api', 'school'],
        validate: {
            params: {
                id: joi.string().required()
            },
            payload: {
                studentName: joi.string().required(),
                studentRoll: joi.string().required(),
                date: joi.string().required(),
                image: joi.string().required()
            }
        },
        handler: function (request, reply) {
            School.findById(request.params.id, (err, school) => {
                if (err) {
                    request.log(['error'], err.stack);
                    return reply(err);
                } else if (school) {
                    let post = new Post(request.payload);
                    post._school = school._id;
                    post.save((err) => {
                        if (err) {
                            request.log(['error'], err.stack);
                            return reply(err);
                        } else {
                            return reply(post).code(201);
                        }
                    });
                } else {
                    return reply('School not found!').code(400);
                }
            });
        }
    }
};

let getPostsBySchool = {
    path: '/api/school/{id}/posts',
    method: 'GET',
    config: {
        description: 'Get all posts by school',
        tags: ['api', 'posts'],
        validate: {
            params: {
                id: joi.string().required()
            }
        },
        handler: function (request, reply) {
            Post.find({_school: request.params.id}, (err, posts) => {
                 if(err) {
                    request.log(['error'], err.stack);
                    return reply(err);
                } else {
                    return reply(posts).code(200);
                }
            });
        }
    }
};

module.exports = [createPost, getPostsBySchool];