/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// node modules
var fs = require("fs"),
    path = require("path");

// required modules
// NOTE: express, http, and socket.io are require'd below if needed.

// our modules
var config = require("./config"),
    exitHandler = require("./modules/exitHandler");


/**
 * The different modules for the different sections of the HTTP server.
 * The keys are the filenames of the modules in `modules/pageServers/`, and the
 * values are the Express paths.
 */
var HTTP_SERVERS = {
    "gameServer": "/game",
    // This one catches everything else
    "homepageServer": "/"
};


///////////////////////////////////////////////////////////////////////////////
// Start HTTP server (if enabled)
var app, server;
if (config.ENABLE_HTTP_SERVER) {
    console.log("Starting SerGIS Game Engine HTTP server on port " + config.PORT);
    
    // Create Express server instance
    var express = require("express");
    app = express();
    server = require("http").Server(app);
    
    // Listen with the HTTP server on our port
    server.listen(config.PORT);

    // Create handler for serving "/static"
    app.use("/static", express.static(config.STATIC_DIR));
    
    // Create handler for serving "/components-static"
    app.use("/components-static", express.static(config.CONTENT_COMPONENTS_STATIC_DIR));
    
    // Create handlers for our other page servers (see HTTP_SERVERS above)
    for (var moduleName in HTTP_SERVERS) {
        if (HTTP_SERVERS.hasOwnProperty(moduleName)) {
            app.use(HTTP_SERVERS[moduleName], require("./modules/pageServers/" + moduleName));
        }
    }
}

////////////////////////////////////////////////////////////////////////////////
// Start socket server (if enabled)
var io;
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
    // Initialize all of our socket-related stuff
    require("./modules/socketServer").init(io);
}

////////////////////////////////////////////////////////////////////////////////
// Make sure we started something
if (!config.ENABLE_HTTP_SERVER && !config.ENABLE_SOCKET_SERVER) {
    // Nope, we didn't actually do anything.
    console.error("Neither HTTP nor socket server enabled!");
} else {
    console.log("");
    // Set up cleanup
    exitHandler.init();
}
