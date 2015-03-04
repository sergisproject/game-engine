/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// node modules
var fs = require("fs"),
    path = require("path");

// required modules
var mongoose = require("mongoose"),
    extend = require("mongoose-schema-extend");

// our modules
var config = require("../config");


/** Functions to call when the database is loaded */
var loadHandlers = [];

/** Models */
var models = exports.models = {};

/** Models directory */
var modelsDir = path.join(__dirname, "models");


// Connect to the MongoDB server
mongoose.connect(config.MONGODB_SERVER, {
    server: {
        keepAlive: 1,
        auto_reconnect: true
    }
});

var db = mongoose.connection;

db.on("error", function (err) {
    console.error("Error connecting to MongoDB at " + config.MONGODB_SERVER + ": ", err.stack);
});

db.once("open", function () {
    console.log("Opened MongoDB connection.");
    
    // Load models from `models` directory
    fs.readdir(modelsDir, function (err, files) {
        if (err) return config.error(err, "reading files from models directory at " + modelsDir);
        
        // Load all the models
        try {
            for (var i = 0; i < files.length; i++) {
                if (files[i].substr(-3) == ".js") {
                    // "require" this file
                    models[files[i].substring(0, files[i].length - 3)] = require(path.join(modelsDir, files[i]))(mongoose, extend);
                }
            }
        } catch (err) {
            console.error("Error loading model: ", err.stack);
            
            // Make sure the MongoDB connection is closed
            exports.close().then(function () {
                process.exit();
            }, function (err) {
                console.error("Error closing database: ", err.stack);
                process.exit();
            });
            
            // And, we're done here
            return;
        }
        
        // Run load handlers
        for (var i = 0; i < loadHandlers.length; i++) {
            loadHandlers[i]();
        }
        // No more load handlers allowed
        loadHandlers = null;
    });
});


/**
 * Add a function to be run once the database is connected (or right away if the
 * database is already connected).
 *
 * @param {Function} callback - The function to call.
 */
exports.addLoadHandler = function (callback) {
    if (Array.isArray(loadHandlers)) {
        // Database connection isn't loaded yet
        loadHandlers.push(callback);
    } else {
        // Loading is already done
        callback();
    }
};


/**
 * Close the MongoDB database connection if opened.
 *
 * @return {Promise} A Promise that will be resolved after we close the database
 *         connection (resolved right away if there is no connection).
 */
exports.close = function () {
    return new Promise(function (resolve, reject) {
        if (mongoose.connection) {
            console.log("Closing MongoDB connection...");
            mongoose.connection.close(function () {
                console.log("Closed MongoDB connection.");
                resolve();
            });
        } else {
            resolve();
        }
    });
};
