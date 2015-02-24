/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// node modules
var fs = require("fs"),
    path = require("path");

// required modules
var mongoose = require("mongoose");

// our modules
var config = require("../config");


// Functions to call when the database is loaded
var loadHandlers = [];

// Connect to the MongoDB server
mongoose.connect(config.MONGODB_SERVER);
var db = mongoose.connection;

db.on("error", function (err) {
    console.error("Error connecting to MongoDB at " + config.MONGODB_SERVER + ": ", err);
});

db.once("open", function () {
    console.log("Opened MongoDB connection.");
    // TODO: Load schemas and models
    
    // Run load handlers
    for (var i = 0; i < loadHandlers.length; i++) {
        loadHandlers[i]();
    }
    // No more load handlers allowed
    loadHandlers = null;
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
