/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// node modules
var fs = require("fs"),
    path = require("path");

// our modules
var config = require("../config");




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
        vars: {},
        cssDependencies: [
            "http://js.arcgis.com/3.11/esri/css/esri.css"
        ],
        jsDependencies: [
            "http://js.arcgis.com/3.11/"
        ]
    },
    
    5: {
        type: "dialog",
        data: {},
        vars: {}
    }
};
////////////////////////////////////////////////////////////////////////////////




// The "/game" socket
var gameSocket;

exports.init = function (io) {
    // Initialize "/game" socket
    io.of("/game").on("connection", function (socket) {
        gameSocket = socket;
        
        gameSocket.on("getUserVar", function (name, callback) {
            // ...
        });
        gameSocket.on("setUserVar", function (name, value, callback) {
            // ...
        });
    });
};


// Writer for Content Component templates
var contentComponentTemplateWriter = new writer.Writer(config.CONTENT_COMPONENTS_TEMPLATES_DIR);


function getContentComponent(id, callback) {
    id = Number(id);
    if (isNaN(id) || !id || !TEST_CONTENT_COMPONENTS.hasOwnProperty(id)) {
        // "Bad Request"
        callback(new Error("Invalid control ID."));
        //writer.writeError(res, 400, "Invalid control ID.");
        return;
    }
    
    var contentComponent = TEST_CONTENT_COMPONENTS[id];
    contentComponentTemplateWriter.render(contentComponent.type + ".html", contentComponent.vars || {}, function (err, data) {
        if (err) {
            console.log("Error rendering Content Component template:", err);
            callback(new Error("Error rendering Content Component template."));
            // "Internal Server Error"
            //writer.writeError(res, 500, "Error rendering Content Component template.");
            return;
        }
        
        callback(null, data);
    });
}
