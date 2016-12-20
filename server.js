'use strict';

const Hapi = require('hapi');
const config = require('config');
const routes = require('hapi-auto-routes');
const mongoose = require('mongoose');
const mongoload = require('mongoload');
const server = new Hapi.Server();
const Pack = require('./package');
const _ = require('lodash');

mongoose.connect(config.database.uri);

if (process.env.NODE_ENV !== 'production') {
  mongoose.set('debug', true);
}

let db = mongoose.connection;

mongoload.bind(mongoose).load({
  pattern: __dirname + '/models/**/*.js'
});

db.on('error', function () {
  server.log('error', 'Connection to db failed!');
  process.exit(0);
});

db.on('connected', function callback() {
  server.log('info', 'Connected to db...');
  startServer();
});

db.on('disconnected', function (err) {
  server.log('error', 'Connection teminated to db');
  process.exit(0);
});


function startServer() {
  server.connection({
    host: config.server.host,
    port: config.server.port,
    routes: {
      cors: {
        origin: ['*'],
        exposedHeaders: ['accept', 'authorization', 'content-type', 'if-none-match', 'origin']
      }
    }
  });

  let requiredHapiPlugins = [
    require('hapi-auth-jwt2'),
    require('inert'),
    require('vision'), {
      'register': require('hapi-swagger'),
      'options': {
        info: {
          'title': 'Kiddo Gardener API Documentation',
          'version': Pack.version
        }
      }
    }, {
      'register': require('good'),
      'options': {
        reporters: [{
          reporter: require('good-console'),
          config: {
            format: 'MMMM Do YYYY h:mm:ss a',
            utc: false,
            color: true
          },
          events: {
            response: '*',
            request: '*',
            log: '*',
            error: '*',
            info: '*'
          }
        }, {
          reporter: require('good-file'),
          events: {
            response: '*',
            request: '*',
            log: '*',
            error: '*',
            ops: '*'
          },
          config: {
            path: __dirname + '/logs',
            rotate: 'daily'
          }
        }]
      }
    }
  ];

  const jwtValidate = function (decoded, request, callback) {
    let User = mongoose.model('user');
    User.findById(decoded._id, function (err, user) {
      if (err) {
        return callback(null, false);
      } else {
        if (user && user.isEnabled && user.email === decoded.email && user.role === decoded.role) {
          return callback(null, true);
        } else {
          return callback(null, false);
        }
      }
    });
  };

  server.register(requiredHapiPlugins, function (err) {
    if (err) {
      throw err;
      process.exit(0);
    } else {
      server.auth.strategy('jwt', 'jwt', {
        key: config.JWTConfig.secret,
        validateFunc: jwtValidate,
        verifyOptions: {algorithms: ['HS256']}
      });

      server.views({
        engines: {
          html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'static'
      });

      routes.bind(server).register({
        pattern: __dirname + '/routes/**/*.js'
      });

      server.start(function () {
        server.log('info', 'Server started... at: ' + server.info.uri);
      });
    }
  });
}

module.exports = server;
