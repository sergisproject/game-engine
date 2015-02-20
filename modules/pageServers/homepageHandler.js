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
    writer = require("../../modules/writer");

/**
 * Express Middleware for handling any requests to the homepage and any
 * other miscellaneous pages (including 404 error pages).
 */
module.exports = function (req, res, next) {
    switch (req.method) {
        case "GET":
            if (req.path == "/") {
                writer.write(res, "homepage.html");
            } else {
                writer.writeError(res, 404);
            }
            break;
        default:
            writer.writeError(res, 405);
    }
};
