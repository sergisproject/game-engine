/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// node modules
var fs = require("fs"),
    path = require("path");

// required modules
var express = require("express");

// our modules
var config = require("../../config"),
    writer = require("../../modules/writer");


// test auth tokens module
var TEST_AUTH_TOKENS = require("../../TEST_AUTH_TOKENS");
// test content components module
var TEST_CONTENT_COMPONENTS = require("../../TEST_CONTENT_COMPONENTS");
// test games module
var TEST_GAMES = require("../../TEST_GAMES");
// test users module
var TEST_USERS = require("../../TEST_USERS");


// The router for /game/
var router = module.exports = express.Router();


// Handler for GET requests to /game/GAME NAME HERE
router.get("/:id", function (req, res) {
    if (!TEST_GAMES.hasOwnProperty(req.params.id)) {
        // "Bad Request"
        writer.writeError(res, 400, "Invalid game ID.");
        return;
    }
    
    writer.write(res, "game.html", {
        "socket-io-src": config.SOCKET_IO_ORIGIN + "/socket.io/socket.io.js",
            
        // NOTE: The following are written to JS variables!
        "js-socket-io-location": (config.SOCKET_IO_ORIGIN ? "" : "window.location.origin + ") + JSON.stringify(config.SOCKET_IO_ORIGIN + "/game"),
        "js-game-id": JSON.stringify(req.params.id),
        "js-auth-token": JSON.stringify("auth_token_3")
    });
});

// Export the router
module.exports = router;
