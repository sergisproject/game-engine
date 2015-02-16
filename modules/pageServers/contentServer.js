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
var TEST_CONTROLS = {
    /*
    id: {
        type: "type here",
        data: {
            // data here
        }
    }
    */
    1: {
        type: "basic",
        data: {}
    }
};
////////////////////////////////////////////////////////////////////////////////



// Handler for GET requests to /content/CONTENT ID HERE
router.get("/:id", function (req, res) {
    var id = Number(req.params.id);
    if (isNaN(id) || !TEST_CONTROLS.hasOwnProperty(id)) {
        // "Bad Request"
        writer.writeError(res, 400);
    } else {
        writer.write(res, "control.html", {
            "socket-io-src": config.SOCKET_IO_ORIGIN + "/socket.io/socket.io.js",
            
            // NOTE: The following are written to JS variables!
            "socket-io-location": config.SOCKET_IO_ORIGIN + "/content",
            "content-type": JSON.stringify(TEST_CONTROLS[id].type),
            "content-data": JSON.stringify(TEST_CONTROLS[id].data)
        });
    }
});

// Export the router
module.exports = router;
