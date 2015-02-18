/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// node modules
var fs = require("fs"),
    path = require("path");

// our modules
var config = require("../config"),
    writer = require("./writer.js");

// test games module
var TEST_GAMES = require("../TEST_GAMES");
// test content components module
var TEST_CONTENT_COMPONENTS = require("../TEST_CONTENT_COMPONENTS");


exports.init = function (io) {
    // Initialize the handler for connections to the "/game" socket
    // This is called each time a new connection is made to the "/game" socket
    io.of("/game").on("connection", function (socket) {
        // Data associated with this specific socket connection
        var socketData = {
            userVars: {}
        };
        
        
        /*
        The client will send a "ready" event once it's all loaded up.
        data: {
            gameID: string
            authToken: string
        }
        callback(error message or null, initial game state)
        */
        socket.on("ready", function (data, callback) {
            // Since it's the first time, set up socketData
            socketData.gameID = data.gameID;
            socketData.authToken = data.authToken;
            
            if (!TEST_GAMES.hasOwnProperty(socketData.gameID)) {
                // Invalid game ID!
                callback("Invalid game ID.");
                return;
            }
            
            // TODO: Query a database of auth tokens to find data about the user corresponding to this auth token.
            // Store this data about the user in socketData (or call `callback` with an error if it's an invalid auth token).
            // ...
            
            // Reply with the game state so the client can begin the game
            callback(null, "GAME STATE HERE");
        });
        
        
        /*
        When the client wants a user variable.
        data: {
            name: string
        }
        callback(error message or null, variable value)
        */
        socket.on("getUserVar", function (data, callback) {
            if (!data || !data.name) {
                callback("Invalid data.");
            } else if (!socketData.userVars.hasOwnProperty(data.name)) {
                callback("Invalid user variable name.");
            } else {
                callback(null, socketData.userVars[name]);
            }
        });
        
        
        /*
        When the client wants to set a user variable.
        data: {
            name: string
            value: string
        }
        callback(error message or null)
        */
        socket.on("setUserVar", function (name, value, callback) {
            socketData.userVars[name] = value;
            callback(null);
        });
    });
};


///////////////////////////////////////////////////////////////////////////////
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
