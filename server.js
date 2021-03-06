/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// node modules
var fs = require("fs"),
    path = require("path");

// required modules
// NOTE: express, cookie-parser, http, socket.io are require'd below if needed.

// our modules
var config = require("./config");
// NOTE: ./modules/db is require'd below if needed.


/**
 * The different modules for the different sections of the HTTP server.
 * The keys are the Express paths, and the values are the filenames of the
 * modules in `modules/pageServers/`.
 */
var HTTP_SERVERS = {
    "/game": "gameHandler",
    "/account": "accountHandler",
    // This one catches everything else
    "/": "homepageHandler"
};


/**
 * The different modules for the different sections of the Socket.IO WebSockets
 * server. The keys are the socket namespaces, and the values are the filenames
 * of the modules in `modules/socketServers/`.
 */
var SOCKET_SERVERS = {
    "/game": "gameSocketHandler"
};


/**
 * Functions to call right before exiting. Each function must return a Promise
 * that will be resolved when it is done cleaning up.
 * @type Array.<Function>
 */
var exitHandlers = [];

/**
 * Initialize the exit handlers.
 */
function initExitHandlers() {
    // So that the server will not close instantly when Ctrl+C is pressed, etc.
    process.stdin.resume();

    // Catch app closing
    process.on("beforeExit", runExitHandlers);

    // Catch exit signals (NOTE: Ctrl+C == SIGINT)
    process.on("SIGINT", runExitHandlers.bind(this, "caught SIGINT"));
    process.on("SIGTERM", runExitHandlers.bind(this, "caught SIGTERM"));
    process.on("SIGHUP", runExitHandlers.bind(this, "caught SIGHUP"));
    
    // Catch uncaught exceptions
    process.on("uncaughtException", function (err) {
        console.log("");
        console.error("UNCAUGHT EXCEPTION: ", err.stack);
        runExitHandlers();
    });
}

/**
 * Run all the exit handlers.
 *
 * @param {string} reason - The reason that we're exiting.
 *
 * @return {Promise} Resolved when all the exit handlers have run; rejected if
 *         an error has occurred.
 */
function runExitHandlers(reason) {
    console.log("");
    console.log("Running exit handlers" + (reason ? " (" + reason + ")" : "") + "...");
    var promises = [];
    // Start from the end and run each exit handler
    while (exitHandlers.length) {
        promises.push(exitHandlers.pop()());
    }
    Promise.all(promises).then(function () {
        console.log("Exiting server...");
        process.exit();
    }, function (err) {
        console.error("Error running exit handler: ", err.stack);
    }).catch(function (err) {
        console.error("Error running exit handlers: ", err.stack);
    });
}


////////////////////////////////////////////////////////////////////////////////

// Make sure we're starting something and, if so, set up exit handling and init
if (config.ENABLE_HTTP_SERVER || config.ENABLE_SOCKET_SERVER) {
    // Set up database
    var db = require("./modules/db");
    db.addLoadHandler(function () {
        // Database is loaded; set up exit handler system
        initExitHandlers();
        
        // Set up exit handler for database
        exitHandlers.push(function () {
            return db.close();
        });
        
        // Initialize the rest of the server
        init();
    });
} else {
    // Nope, we didn't actually do anything.
    console.error("Neither HTTP nor socket server enabled!");
}


var app, server, io;
/** Set up the HTTP and/or socket server. */
function init() {
    // Start HTTP server (if enabled)
    if (config.ENABLE_HTTP_SERVER) {
        console.log("Starting SerGIS Game Engine HTTP server on port " + config.PORT);

        // Create Express server instance
        var express = require("express"),
            cookieParser = require("cookie-parser");
        
        app = express();
        server = require("http").Server(app);

        // Listen with the HTTP server on our port
        server.listen(config.PORT);

        // Create handler for serving "/static"
        app.use("/static", express.static(config.STATIC_DIR));
        
        // Set up cookie processing
        app.use(cookieParser(config.COOKIE_SIGNING_KEY || undefined));

        // Create handler for serving "/components-static"
        app.use("/components-static", express.static(config.CONTENT_COMPONENTS_STATIC_DIR));

        // Create handlers for our other page servers (see HTTP_SERVERS above)
        for (var pathDescrip in HTTP_SERVERS) {
            if (HTTP_SERVERS.hasOwnProperty(pathDescrip)) {
                app.use(pathDescrip, require("./modules/pageServers/" + HTTP_SERVERS[pathDescrip]));
            }
        }
    }

    // Start socket server (if enabled)
    if (config.ENABLE_SOCKET_SERVER) {
        // Check if we already have the Express HTTP server
        if (app) {
            console.log("Starting SerGIS Game Engine socket server with HTTP server");
            // Use the same server instance for the socket.io server
            io = require("socket.io")(server);
        } else {
            console.log("Starting SerGIS Game Engine socket server on port " + config.PORT);
            // There's no HTTP server yet; make socket.io listen all by its lonesomes
            io = require("socket.io").listen(config.PORT);
        }

        // Create handlers for all our socket servers (see SOCKET_SERVERS above)
        for (var pathDescrip in SOCKET_SERVERS) {
            if (SOCKET_SERVERS.hasOwnProperty(pathDescrip)) {
                //io.of(pathDescrip).on("connection", require("./modules/socketServers/" + SOCKET_SERVERS[pathDescrip]));
                io.of(pathDescrip).use(require("./modules/socketServers/" + SOCKET_SERVERS[pathDescrip]));
            }
        }
    }
    
    // Get ready for more
    console.log("");
}
