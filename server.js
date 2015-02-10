/*
    The SerGIS Project - sergis-game

    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
 */

// node modules
var fs = require("fs"),
    path = require("path");

// required modules
var express = require("express"),
    app = express(),
    server = require("http").Server(app),
    io = require("socket.io")(server);

/**
 * SerGIS Server configuration.
 * @todo Move to external file.
 */
var config = {
    /** Default server port */
    PORT: process.env.PORT || 3000,
    
    /** Templates directory */
    TEMPLATES_DIR: path.join(__dirname, "templates"),
    
    /** Web resources directory (mapped to http://this-nodejs-server/static/...) */
    STATIC_DIR: path.join(__dirname, "static"),
};

/**
 * Functions to call right before exiting.
 * @type Array.<Function>
 */
var exitHandlers = [];

///////////////////////////////////////////////////////////////////////////////
// Set up cleanup on exit
function setupCleanup() {
    // So that the program will not close instantly when Ctrl+C is pressed, etc.
    process.stdin.resume();

    // Catch app closing
    process.on("exit", function () {
        console.log("Exiting...");
        exitHandlers.forEach(function (item) {
            try {
                item();
            } catch (err) {
                console.error("Error running exit handler: ", err);
            }
        });
        return true;
    });

    // Catch Ctrl+C event
    process.on("SIGINT", function () {
        console.log("Caught SIGINT...");
        process.exit(2);
    });
}

///////////////////////////////////////////////////////////////////////////////
// Start HTTP server
console.log("Starting SerGIS server on port " + config.PORT);
server.listen(config.PORT);

// Create handler for serving "/lib"
app.use("/static", express.static(config.STATIC_DIR));

// Set up cleanup
setupCleanup();
