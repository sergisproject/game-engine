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
        type: "basic-html",
        data: {
            html: "<strong><i>SOME</i> HTML</strong>"
        }
    },
    
    2: {
        type: "basic-html",
        data: {
            html: "<strong><i>SOME</i> HTML</strong> #2"
        }
    },
    
    3: {
        type: "basic-html",
        data: {
            html: "<strong><i>SOME</i> HTML</strong> #3"
        }
    },
};
////////////////////////////////////////////////////////////////////////////////



// Handler for GET requests to /content/CONTENT ID HERE
router.get("/:id", function (req, res) {
    var id = Number(req.params.id);
    if (isNaN(id) || !TEST_CONTROLS.hasOwnProperty(id)) {
        // "Bad Request"
        writer.writeError(res, 400, "Invalid control ID.");
        return;
    }
    
    var control = TEST_CONTROLS[id];
    fs.readFile(path.join(config.CONTENT_COMPONENTS_TEMPLATES_DIR, control.type + ".html"), {
        encoding: "utf-8"
    }, function (err, data) {
        if (err) {
            console.log("Error reading Content Component file:", err);
            // "Internal Server Error"
            writer.writeError(res, 500, "Error reading Content Component file.");
            return;
        }
        
        writer.write(res, "content.html", {
            "socket-io-src": config.SOCKET_IO_ORIGIN + "/socket.io/socket.io.js",
            "content-type": TEST_CONTROLS[id].type,
            "content-component-html": data,
            
            // NOTE: The following are written to JS variables!
            "js-socket-io-location": (config.SOCKET_IO_ORIGIN ? "" : "window.location.origin + ") + JSON.stringify(config.SOCKET_IO_ORIGIN + "/content"),
            "js-content-type": JSON.stringify(TEST_CONTROLS[id].type),
            "js-content-data": JSON.stringify(TEST_CONTROLS[id].data)
        });
    });
});

// Export the router
module.exports = router;
