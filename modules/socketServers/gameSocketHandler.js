/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// node modules
var fs = require("fs"),
    path = require("path");

// our modules
var config = require("../../config"),
    db = require("../db"),
    writer = require("../writer.js");

// test auth tokens module
var TEST_AUTH_TOKENS = require("../../TEST_AUTH_TOKENS");
// test content components module
var TEST_CONTENT_COMPONENTS = require("../../TEST_CONTENT_COMPONENTS");
// test games module
var TEST_GAMES = require("../../TEST_GAMES");
// test users module
var TEST_USERS = require("../../TEST_USERS");


/**
 * Initialize the handler for connections to the "/game" socket.
 * This is called each time a new connection is made to the "/game" socket.
 *
 * @param socket - The Socket instance.
 * @param {Function} next - The function to call once we have initialized the
 *        socket on our end.
 */
module.exports = function (socket, next) {
    /*
    The client will send a "ready" event once it's all loaded up.
    data: {
        gameName: string
        authToken: string
    }
    callback(error message or null, initial game state)
    */
    socket.on("ready", function (data, callback) {
        var gameName = data.gameName,
            authToken = data.authToken;

        // Check auth token
        if (!TEST_AUTH_TOKENS.hasOwnProperty(authToken)) {
            // Invalid auth token!
            callback("Invalid auth token.");
            return;
        }
        
        // Get user from auth token
        var user = TEST_USERS[TEST_AUTH_TOKENS[authToken].userID];
        
        // Check game ID
        if (!TEST_GAMES.hasOwnProperty(gameName)) {
            // Invalid game ID!
            callback("Invalid game ID.");
            return;
        }
        
        // Get game from game ID
        var game = TEST_GAMES[gameName];
        
        // All is good; make GameSocket
        new GameSocket(socket, game, user, callback);
    });
    
    // Everything's initialized for us; move on!
    next();
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
            config.error(err, "rendering Content Component template");
            callback(new Error("Error rendering Content Component template."));
            // "Internal Server Error"
            //writer.writeError(res, 500, "Error rendering Content Component template.");
            return;
        }
        
        callback(null, data);
    });
}



// Documentation for the callback functions to send a reply back to the client:
/**
 * A callback function to call in reply to an event sent by the client.
 * @callback GameSocket~requestCallback
 * @param {?string} err - An error message, or null if there was no error.
 * @param {*} [response] - Response data, if there was no error.
 */


/**
 * Class representing a socket connection with a specific game and user.
 * @class
 *
 * @param socket - The Socket.IO socket connection to the client.
 * @param {object} game - The game data from the database.
 * @param {object} user - The user data from the database.
 * @param {GameSocket~requestCallback} initialCallback - The callback to give
 *        the client the initial game state.
 */
function GameSocket(socket, game, user, initialCallback) {
    this.socket = socket;
    this.game = game;
    this.user = user;
    
    // Check user object
    if (!this.user.games) this.user.games = {};
    if (!this.user.games[this.game.name]) this.user.games[this.game.name] = {};
    
    // Make shortcut for user.games[game.name]
    this.userGame = this.user.games[this.game.name];
    
    // Check userGame.userVars
    if (!this.userGame.userVars) this.userGame.userVars = {};
    
    // Check userGame.currentGameStateIndex
    if (typeof this.userGame.currentGameStateIndex != "number") {
        this.userGame.currentGameStateIndex = this.game.initialGameStateIndex;
    }
    
    // Set up socket handlers (getUserVar, setUserVar)
    for (var eventName in GameSocket.handlers) {
        if (GameSocket.handlers.hasOwnProperty(eventName)) {
            this.socket.on(eventName, GameSocket.handlers[eventName].bind(this));
        }
    }
    
    // Get dat client started
    initialCallback(null, this.game.gameStates[this.userGame.currentGameStateIndex].contentComponents);
}

/**
 * Handlers for client socket events.
 * Each is called with 2 parameters: `data` and `callback` (both specified by
 * the client).
 * The `this` value in each function when it is called is the current GameSocket
 * instance.
 *
 * @type Array.<Function>
 */
GameSocket.handlers = {
    /**
     * Handler for client socket "getUserVar" event.
     * Called by the client to get the value of a user variable.
     *
     * @this GameSocket
     * @param {object} data - name (string): the name of the variable to get.
     * @param {GameSocket~requestCallback} callback
     */
    getUserVar: function (data, callback) {
        if (!data || !data.name) {
            callback("Invalid data.");
        } else if (!this.userGame.userVars.hasOwnProperty(data.name)) {
            callback("Invalid user variable name.");
        } else {
            callback(null, this.userGame.userVars[name]);
        }
    },

    /**
     * Handler for client socket "setUserVar" event.
     * Called by the client to set a user variable.
     *
     * @this GameSocket
     * @param {object} data - name (string): the name of the variable to set.
     *                        value (string): the value of the variable to set.
     * @param {GameSocket~requestCallback} callback
     */
    setUserVar: function (data, callback) {
        this.userGame.userVars[data.name] = data.value;
        callback(null);
    }
};
