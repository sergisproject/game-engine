/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// node modules
var fs = require("fs"),
    path = require("path");

// required modules
var router = require("express").Router();

// our modules
var config = require("../../config"),
    writer = require("../../modules/writer");



////////////////////////////////////////////////////////////////////////////////
var TEST_GAMES = {
    "testgame": [
        {
            geometry: {
                left: "0",
                top: "0",
                width: "100%",
                height: "100px"
            },
            content_id: 1
        },
        
        {
            geometry: {
                left: "0",
                top: "100px",
                bottom: "0",
                width: "50%"
            },
            content_id: 2
        },
        
        {
            geometry: {
                right: "0",
                top: "100px",
                bottom: "0",
                width: "50%"
            },
            content_id: 3
        }
    ]
};
////////////////////////////////////////////////////////////////////////////////





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
        "js-socket-io-location": (config.SOCKET_IO_ORIGIN ? "" : "window.location.origin + ") + JSON.stringify(config.SOCKET_IO_ORIGIN + "/content"),
        "js-game-id": JSON.stringify(req.params.id),
        "js-game-content-components": JSON.stringify(TEST_GAMES[req.params.id])
    });
});

// Export the router
module.exports = router;
