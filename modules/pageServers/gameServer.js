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

// Handler for GET requests to /game/GAME NAME HERE
router.get("/:name", function (req, res) {
    writer.write(res, "game.html", {
        // NOTE: game-name is written to a JS variable!
        "game-name": req.params.name.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/'/g, "\\'"),
        "socket-io-src": config.SOCKET_IO_ORIGIN + "/socket.io/socket.io.js"
    });
});

// Export the router
module.exports = router;
