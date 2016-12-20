'use strict';

const joi = require('joi');
const mongoose = require('mongoose');
const config = require('config');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const User = mongoose.model('user');

let login = {
    path: '/api/auth/sign-in',
    method: 'POST',
    config: {
        description: 'Admin login',
        tags: ['api', 'login', 'admin'],
        validate: {
            payload: {
                email: joi.string().email().required(),
                password: joi.string().required()
            }
        },
        handler: function (request, reply) {
            User.findOne({username: request.payload.email}, '+password', (err, user) => {
                if (err) {
                    request.log(['error', 'db'], err.stack);
                    return reply(err);
                } else if (user) {
                     if (!user.isEnabled) {
                        request.log(['info', 'auth'], 'User not enabled!');
                        return reply('Your account is not active, please contact us immediately!').code(403);
                    } else {
                        if (bcrypt.compareSync(request.payload.password, user.password)) {
                            var token = jwt.sign(_.pick(user, ['_id', 'name', 'username', 'createdAt', 'isEnabled', 'isAdmin']), config.JWTConfig.secret);
                            return reply(token).code(200).header('Authorization', token);
                        } else {
                            return reply('Invalid Password!').code(401);
                        }
                    }
                } else {
                    return reply('Invalid email').code(401);
                }
            });
        }
    }
};

module.exports = [login];