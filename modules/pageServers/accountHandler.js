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

router.get("/logout", function (req, res) {
    checkToken(req, res, pageHandlers.logout);
});

router.post("/logout", function (req, res) {
    checkToken(req, res, pageHandlers.logout);
});

router.get("", function (req, res) {
    checkToken(req, res, pageHandlers.home);
});

router.post("", function (req, res) {
    checkToken(req, res, true, pageHandlers.homePost);
});

router.get("/admin", function (req, res) {
    checkToken(req, res, pageHandlers.admin);
});

router.post("/admin", function (req, res) {
    checkToken(req, res, true, pageHandlers.adminPost);
});


/** Page handlers */
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
            // First, check if it's the SUPER-ADMIN login
            if (config.SUPER_ADMIN_USERNAME && config.SUPER_ADMIN_PASSWORD &&
                username === config.SUPER_ADMIN_USERNAME && password === config.SUPER_ADMIN_PASSWORD) {
                // Woohoo, super admin!!
                authToken.superAdmin = true;
                authToken.save(function (err) {
                    if (err) {
                        config.error(err, "saving authToken after assigning superAdmin");
                        writer.writeError(res, 500);
                        return;
                    }
                    
                    // Redirect to admin page
                    res.redirect("/account/admin");
                });
            } else {
                // Must be just a normal user
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
            }
        } else {
            writer.write(res, "account_login.html", {
                error: "Please enter both a username and a password.",
                rememberMe: rememberMe
            });
        }
    },
    
    ////////////////////////////////////////////////////////////////////////////
    // Handler for GET and POST requests to /account/logout
    logout: function (req, res, authToken) {
        // Destroy the auth token
        db.models.AuthToken.remove({_id: authToken._id}, function (err) {
            if (err) config.error(err, "logging off / removing auth token");
            // Remove the auth token cookie
            res.clearCookie("t", {signed: true});
            // Redirect to login page
            res.redirect("/account/login");
        });
    },
    
    ////////////////////////////////////////////////////////////////////////////
    // Handler for GET requests (and POST, indirectly) to /account or /account/
    home: function (req, res, authToken) {
        // If it's the super admin, redirect to the admin page
        if (authToken.superAdmin) {
            res.redirect("/account/admin");
        // If the user isn't logged in, they need to do that first
        } else if (!authToken.user) {
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
                    games: allowedGames,
                    admin: !!(authToken.user.privileges.fullAdmin)
                });
            });
        }
    },
    
    ////////////////////////////////////////////////////////////////////////////
    // Handler for POST requests to /account or /account/
    homePost: function (req, res, authToken) {
        pageHandlers.home(req, res, authToken);
    },
    
    ////////////////////////////////////////////////////////////////////////////
    // Handler for GET requests (and POST, indirectly) to /account/admin
    admin: function (req, res, authToken, message) {
        // Is the user allowed to access this page?
        if (authToken.superAdmin || (authToken.user && authToken.user.privileges.fullAdmin)) {
            db.models.User.find({}, function (err, users) {
                if (err) {
                    config.error(err, "finding users for admin page");
                    writer.writeError(res, 500);
                    return;
                }

                writer.write(res, "account_admin.html", {
                    name: authToken.user ? (authToken.user.name || authToken.user.username) : "Super Admin",
                    users: users,
                    message: message || undefined
                });
            });
        } else {
            // No access for you!
            writer.writeError(res, 403);
        }
    },
    
    ////////////////////////////////////////////////////////////////////////////
    // Handler for POST requests to /account/admin
    adminPost: function (req, res, authToken) {
        // Is the user allowed to access this page?
        if (authToken.superAdmin || (authToken.user && authToken.user.privileges.fullAdmin)) {
            var action = req.body.action;
            if (!action) {
                // Try to find the action...
                if (req.body.deleteUser) action = "deleteUser";
            }
            
            if (adminFunctions.hasOwnProperty(action)) {
                adminFunctions[action](req.body, authToken).then(function (message) {
                    // Everything was good, write out the admin page
                    pageHandlers.admin(req, res, authToken, message);
                }, function (err) {
                    // AHHHH!
                    config.error(err, "handling admin function: " + action);
                    writer.writeError(res, 500);
                });
            } else {
                // Bad Request
                writer.writeError(res, 400);
            }
        } else {
            // No access for you!
            writer.writeError(res, 403);
        }
    }
};


/**
 * Admin functions.
 * Each function is passed 2 arguments:
 *    the POST variables, and 
 *    the auth token for the current user.
 * Each function must return a Promise.
 */
var adminFunctions = {
    createUser: function (post, authToken) {
        return new Promise(function (resolve, reject) {
            var username = post.u, password = post.p;
            if (username && password) {
                var user = new db.models.User({
                    username: username,
                    name: post.name || undefined,
                    privileges: {
                        fullAdmin: post.fullAdmin === "fullAdmin"
                    },
                    creator: authToken.user || undefined
                });
                // setPassword automatically saves (if it's successful) before resolving
                user.setPassword(password).then(function () {
                    resolve("User " + username + " created successfully.");
                }, reject);
            } else {
                // It's not a fatal error, so just report it back
                resolve("Username or password missing!");
            }
        });
    },
    
    deleteUser: function (post, authToken) {
        return new Promise(function (resolve, reject) {
            // We know that post.deleteUser exists (since that's how we figured
            // out what the action was)
            db.models.User.remove({username: post.deleteUser}, function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                
                resolve(post.deleteUser + " deleted successfully.");
            });
        });
    }
};


