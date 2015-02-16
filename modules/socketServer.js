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


// The "/game" socket
var gameSocket;

// The "/content" socket
var contentSocket;

exports.init = function (io) {
    // Initialize "/game" socket
    io.of("/game").on("connection", function (socket) {
        gameSocket = socket;
        
        //gameSocket.on("contentLoaded", function (..., ..., callback) {
        //});
    });
    
    // Initialize socket
    io.of("/content").on("connection", function (socket) {
        contentSocket = socket;
    });
};
