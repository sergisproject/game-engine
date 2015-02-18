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




// Handler for GET requests to /content/CONTENT ID HERE
router.get("/:id", function (req, res) {
    var id = Number(req.params.id);
    if (isNaN(id) || !TEST_CONTENT_COMPONENTS.hasOwnProperty(id)) {
        // "Bad Request"
        writer.writeError(res, 400, "Invalid control ID.");
        return;
    }
    
    var contentComponent = TEST_CONTENT_COMPONENTS[id];
    contentComponentTemplateWriter.render(contentComponent.type + ".html", contentComponent.vars || {}, function (err, data) {
        if (err) {
            console.log("Error rendering Content Component template:", err);
            // "Internal Server Error"
            writer.writeError(res, 500, "Error rendering Content Component template.");
            return;
        }
        
        writer.write(res, "content.html", {
            "socket-io-src": config.SOCKET_IO_ORIGIN + "/socket.io/socket.io.js",
            "content-type": contentComponent.type,
            "content-component-html": data,
            
            // NOTE: The following are written to JS variables!
            "js-socket-io-location": (config.SOCKET_IO_ORIGIN ? "" : "window.location.origin + ") + JSON.stringify(config.SOCKET_IO_ORIGIN + "/content"),
            "js-content-type": JSON.stringify(contentComponent.type),
            "js-content-data": JSON.stringify(contentComponent.data).replace(/<\/script>/g, '</scr" + "ipt>')
        });
    });
});

// Export the router
module.exports = router;
