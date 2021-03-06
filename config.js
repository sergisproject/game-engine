/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

var path = require("path");
var config = module.exports = {};


////////////////////////////////////////////////////////////////////////////////
// Authentication

/**
 * Super-admin account.
 *
 * The super-admin username and password are attached to an account with full
 * admin access, but no other rights as an account (i.e., they can't use their
 * account to play games, etc.)
 * This is useful when first setting up the server (before any real accounts are
 * created yet).
 *
 * Set the username and/or the password to a falsy value to disable the super-
 * admin account (recommended after server is set up).
 */
config.SUPER_ADMIN_USERNAME = "admin";
config.SUPER_ADMIN_PASSWORD = "admin";


////////////////////////////////////////////////////////////////////////////////
// Server

/** Whether we're in development mode */
//config.DEVELOPMENT = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() == "development";
config.DEVELOPMENT = true;

/** HTTP server port */
config.PORT = process.env.PORT || 3000;

/** MongoDB server URI */
config.MONGODB_SERVER = "mongodb://localhost/sergis-game-test";

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


////////////////////////////////////////////////////////////////////////////////
// Directories

/** Templates directory */
config.TEMPLATES_DIR = path.join(__dirname, "templates");

/** Static resources directory (mapped to http://this-nodejs-server/static/...) */
config.STATIC_DIR = path.join(__dirname, "static");

/** Content Components static directory */
config.CONTENT_COMPONENTS_STATIC_DIR = path.join(__dirname, "content-components", "static");

/** Content Components template directory */
config.CONTENT_COMPONENTS_TEMPLATES_DIR = path.join(__dirname, "content-components", "templates");


////////////////////////////////////////////////////////////////////////////////
// Misc.

/** Cookie signing key (if not specified, cookies are not signed) */
config.COOKIE_SIGNING_KEY = "testsigner";

/**
 * Function to handle reporting any errors.
 * It must be defined as something, even if it's just an empty function
 * (otherwise, expect little errors to make everything explode).
 *
 * @param {Error} err - An Error object representing the error.
 * @param {string} [details=""] - Any details about what may have caused the
 *        error.
 */
config.error = function (err, details) {
    console.error("\nError" + (details ? " (" + details + ")" : "") + ": ", err.stack);
};

