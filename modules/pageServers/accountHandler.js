/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// node modules
var fs = require("fs"),
    path = require("path");

// required modules
var express = require("express"),
    bodyParser = require("body-parser");

// our modules
var config = require("../../config"),
    writer = require("../writer"),
    db = require("../db");


// The router for /account/
var router = module.exports = express.Router();

/**
 * Shortcut for AuthToken.checkTokenFromReq.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param {boolean} [regenerateToken=false] - Whether to regenerate the token
 *        even if we don't have to.
 * @param {Function} pageHandler - Function to call (if successful) with:
 *        the Express request, the Express response, the auth token
 */
function checkToken(req, res, regenerateToken, pageHandler) {
    if (typeof regenerateToken == "function") {
        // It's actually the callback!
        pageHandler = regenerateToken;
        regenerateToken = false;
    }
    db.models.AuthToken.checkTokenFromReq(req, !!regenerateToken).then(function (authToken) {
        // Set the new token
        res.cookie("t", authToken.token, {signed: true});
        // And, continue on our ways
        pageHandler(req, res, authToken);
    }, function (err) {
        // AHHHHHHHHHHHHHHHHHHH!!!
        config.error(err, "checking auth token");
        writer.writeError(res, 500);
    });
}

// Set up body parser for POST data
router.use(bodyParser.urlencoded({
    extended: true
}));

router.get("/login", function (req, res) {
    checkToken(req, res, pageHandlers.loginGet);
});

router.post("/login", function (req, res) {
    checkToken(req, res, true, pageHandlers.loginPost);
});

router.get("", function (req, res) {
    checkToken(req, res, pageHandlers.homeGet);
});

router.post("", function (req, res) {
    checkToken(req, res, true, pageHandlers.homePost);
});

router.get("/admin", function (req, res) {
    checkToken(req, res, pageHandlers.adminGet);
});

router.post("/admin", function (req, res) {
    checkToken(req, res, true, pageHandlers.adminPost);
});


var pageHandlers = {
    ////////////////////////////////////////////////////////////////////////////
    // Handler for GET requests to /account/login
    loginGet: function (req, res, authToken) {
        // Is the user already logged in?
        if (authToken.user) {
            // Redirect to account home page
            res.redirect("/account");
        } else {
            // Write out the login page
            writer.write(res, "account_login.html");
        }
    },
    
    ////////////////////////////////////////////////////////////////////////////
    // Handler for POST requests to /account/login
    loginPost: function (req, res, authToken) {
        // Check username/password
        var username = req.body.u,
            password = req.body.p,
            rememberMe = req.body.r === "r";
        if (username && password) {
            db.models.User.checkLoginInfo(username, password).then(function (user) {
                if (!user) {
                    writer.write(res, "account_login.html", {
                        error: "Username or password incorrect.",
                        rememberMe: rememberMe
                    });
                    return;
                }
                
                // We're all logged in now!
                authToken.user = user;
                authToken.save(function (err) {
                    if (err) {
                        config.error(err, "saving authToken after assigning user");
                        writer.writeError(res, 500);
                        return;
                    }
                    
                    // We're all good now; redirect to account home
                    res.redirect("/account");
                });
            }, function (err) {
                config.error(err, "checking login info");
                writer.writeError(res, 500);
            });
        } else {
            writer.write(res, "account_login.html", {
                error: "Please enter both a username and a password.",
                rememberMe: rememberMe
            });
        }
    },
    
    ////////////////////////////////////////////////////////////////////////////
    // Handler for GET requests to /account or /account/
    homeGet: function (req, res, authToken) {
        // If the user isn't logged in, they need to do that first
        if (!authToken.user) {
            res.redirect("/account/login");
        } else {
            // Get list of all the games
            db.models.Game.find({}, function (err, games) {
                if (err) {
                    config.error(err, "finding games");
                    writer.writeError(res, 500);
                    return;
                }
                
                // Make a list of allowed games for the user
                var allowedGames = [];
                games.forEach(function (game) {
                    if (game.access == "public" || game.access == "protected" ||
                        authToken.user.allowedGames.indexOf(game._id) != -1) {
                        // The user can access this game!
                        var lastPlayed = (
                            authToken.user.playedGames[game.name] &&
                            authToken.user.playedGames[game.name].lastPlayed &&
                            (new Date(authToken.user.playedGames[game.name].lastPlayed)).toUTCString()
                        ) || "Never played.";
                        allowedGames.push({
                            game: game,
                            lastPlayed: lastPlayed
                        });
                    }
                });
                
                // Write out the account home page
                writer.write(res, "account_home.html", {
                    name: authToken.user.name || authToken.user.username,
                    games: allowedGames
                });
            });
        }
    },
    
    ////////////////////////////////////////////////////////////////////////////
    // Handler for POST requests to /account or /account/
    homePost: function (req, res, authToken) {
        res.redirect("/account");
    },
    
    ////////////////////////////////////////////////////////////////////////////
    // Handler for GET requests to /account/admin
    adminGet: function (req, res, authToken) {
        // TODO: Check if a user is logged in and, if so, whether they have admin privileges
        db.models.User.find({}, function (err, users) {
            if (err) {
                config.error(err, "finding users");
                writer.writeError(res, 500);
                return;
            }
            
            writer.write(res, "account_admin.html", {
                users: users
            });
        });
    },
    
    ////////////////////////////////////////////////////////////////////////////
    // Handler for POST requests to /account/admin
    adminPost: function (req, res, authToken) {
        // TODO: Check if a user is logged in and has admin privileges
        // All the possible variables
        var action = req.body.action,
            username = req.body.u,
            password = req.body.p;
        switch (action) {
            case "createUser":
                if (username && password) {
                    var user = new db.models.User({
                        username: username
                    });
                    user.setPassword(password).then(function () {
                        res.redirect("/account/admin");
                    }, function (err) {
                        config.error(err, "setting password");
                        writer.writeError(res, 500);
                        return;
                    });
                } else {
                    res.redirect("/account/admin");
                }
                break;
            default:
                res.redirect("/account/admin");
        }
    }
};

