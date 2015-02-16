/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

var path = require("path");
var config = {};

/** Whether we're in development mode */
//config.DEVELOPMENT = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() == "development";
config.DEVELOPMENT = true;

/** HTTP server port */
config.PORT = process.env.PORT || 3000;

/** Templates directory */
config.TEMPLATES_DIR = path.join(__dirname, "templates");

/** Static resources directory (mapped to http://this-nodejs-server/static/...) */
config.STATIC_DIR = path.join(__dirname, "static");

/** Content Components static directory */
config.CONTENT_COMPONENTS_STATIC_DIR = path.join(__dirname, "content-components", "static");

/** Content Components template directory */
config.CONTENT_COMPONENTS_TEMPLATES_DIR = path.join(__dirname, "content-components", "templates");

/** Whether to start the HTTP server */
config.ENABLE_HTTP_SERVER = true;

/** Whether to start the WebSockets (socket.io) server */
config.ENABLE_SOCKET_SERVER = true;

/**
 * Origin for the socket.io server (i.e. the URL without the pathname).
 *
 * If the socket.io server is the same as the HTTP server (i.e. both
 * config.ENABLE_HTTP_SERVER and config.ENABLE_SOCKET_SERVER are true),
 * set this to the empty string.
 */
config.SOCKET_IO_ORIGIN = "";


module.exports = config;
