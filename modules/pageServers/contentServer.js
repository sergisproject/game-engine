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
var TEST_CONTENT_COMPONENTS = {
    /*
    id: {
        type: "Content Component type here",
        data: {
            // Content Component data here
        },
        vars: {
            // Content Component template vars here
        }
    }
    */
    
    1: {
        type: "basic-html",
        data: {},
        vars: {
            html: "<strong><i>SOME</i> HTML</strong>",
            js: 'document.body.style.backgroundColor = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ")";'
        }
    },
    
    2: {
        type: "basic-html",
        data: {},
        vars: {
            html: "<strong><i>SOME</i> HTML</strong> #2",
            js: 'document.body.style.backgroundColor = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ")";'
        }
    },
    
    3: {
        type: "basic-html",
        data: {},
        vars: {
            html: "<strong><i>SOME</i> HTML</strong> #3",
            js: 'document.body.style.backgroundColor = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ")";'
        }
    },
    
    4: {
        type: "map",
        data: {
            map: {
                latitude: 0,
                longitude: 0,
                zoom: 5,
                basemap: "",
                layers: []
            }
        },
        vars: {}
    },
    
    5: {
        type: "dialog",
        data: {},
        vars: {}
    }
};
////////////////////////////////////////////////////////////////////////////////



// Handler for GET requests to /content/CONTENT ID HERE
router.get("/:id", function (req, res) {
    var id = Number(req.params.id);
    if (isNaN(id) || !TEST_CONTENT_COMPONENTS.hasOwnProperty(id)) {
        // "Bad Request"
        writer.writeError(res, 400, "Invalid control ID.");
        return;
    }
    
    var contentComponent = TEST_CONTENT_COMPONENTS[id];
    writer.setTemporaryRoot(config.CONTENT_COMPONENTS_TEMPLATES_DIR);
    writer.render(contentComponent.type + ".html", contentComponent.vars || {}, function (err, data) {
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
