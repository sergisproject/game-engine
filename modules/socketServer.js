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


// The socket.io server instance
var io;

exports.init = function (_io) {
    io = _io;
};
