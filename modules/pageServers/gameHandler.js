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
    db = require("../db"),
    writer = require("../writer");


// The router for /game/
var router = module.exports = express.Router();


// TESTING: This creates a "fake" game.
router.get("/make", function (req, res) {
    var randomGameID = Math.random().toString().substring(2, 6);
    
    // Make some game states
    var gameStates = [
        new db.models.GameState({
            name: "Initial game state for make-" + randomGameID
        })
    ];
    
    // Function to save all the game states
    function saveGameStates() {
        var gameStateSavePromises = [];
        gameStates.forEach(function (gameState) {
            gameStateSavePromises.push(new Promise(function (resolve, reject) {
                gameState.save(function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            }));
        });
        return Promise.all(gameStateSavePromises);
    };
    
    saveGameStates().then(function () {
        // Make the game
        var game = new db.models.Game({
            name: "make-" + randomGameID,
            displayName: "Random Game " + randomGameID,
            initialGameState: gameStates[0]
        });
        game.save(function (err) {
            if (err) throw err;
            res.end("Created /game/make-" + randomGameID);
        });
    });
});


// Handler for GET requests to /game/GAME NAME HERE
router.get("/:name", function (req, res) {
    // Get/set auth token
    db.models.AuthToken.checkTokenFromReq(req).then(function (authToken) {
        // Set the new token
        res.cookie("t", authToken.token, {signed: true});
        // Get the game by its name
        var name = req.params.name;
        db.models.Game.findOne({name: name}).populate("gameStates").exec(function (err, game) {
            if (err) {
                config.error(err, "finding game by name: " + name);
                writer.writeError(res, 500, "Invalid game name.");
                return;
            }
            
            if (!game) {
                writer.writeError(res, 404, "Game " + name + " not found.");
                return;
            }

            // If required, make sure a user is logged in
            if (game.access != "public") {
                // Now, if no user, redirect to login
                if (!authToken.user) {
                    res.redirect("/account/login?game=" + encodeURIComponent(req.params.name));
                    return;
                }

                // We know that a user is logged in; make sure that she is allowed to play this game
                if (game.access == "private" && authToken.user.allowedGames.indexOf(game._id) == -1) {
                    // User ain't allowed to play this game!
                    writer.writeError(res, 403, authToken.user.name + " does not have access to this game.");
                    return;
                }
            }

            // If we're still here, all permissions are good, so write out the game!
            writer.write(res, "game.html", {
                "socket-io-src": config.SOCKET_IO_ORIGIN + "/socket.io/socket.io.js",

                // NOTE: The following are written to JS variables!
                "js-socket-io-location": (config.SOCKET_IO_ORIGIN ? "" : "window.location.origin + ") + JSON.stringify(config.SOCKET_IO_ORIGIN + "/game"),
                "js-game-name": JSON.stringify(name),
                "js-auth-token": JSON.stringify(authToken.token)
            });
        }, function (err) {
            config.error(err, "checking auth token");
            writer.writeError(res, 500);
        });
    });
});

// Export the router
module.exports = router;
