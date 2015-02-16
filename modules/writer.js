/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// node modules
var path = require("path");

// required modules
var mu = require("mu2");

// our modules
var config = require("../config");


// Enable cache if we're not in development mode
if (config.DEVELOPMENT) {
    mu.clearCache();
} else {
    console.log("Using mu cache");
}

// Set templates directory
mu.root = config.TEMPLATES_DIR;

/**
 * Write a template to an output stream.
 * writer.write(res, template name, [template vars, [status], [headers]])
 *
 * @param res - The Express response object.
 * @param {string} template - The name of the template to use.
 * @param {object} [vars={}] - Variables for the template.
 * @param {number} [status=200] - HTTP status.
 * @param {object} [headers={}] - Any HTTP headers to send.
 */
exports.write = function (res, template, vars, status, headers) {
    if (status && typeof status == "object") {
        headers = status;
        status = null;
    }
    
    if (!headers || typeof headers != "object") headers = {};
    if (!headers["Content-Type"]) headers["Content-Type"] = "text/html";
    if (!headers["Cache-Control"]) headers["Cache-Control"] = "no-cache";
    res.writeHead(status || 200, headers);
    
    if (config.DEVELOPMENT) {
        mu.clearCache();
    }
    mu.compileAndRender(template, vars || {}).pipe(res);
};

exports.writeError = function (res, num, details) {
    var httpError = "";
    switch (num) {
        case 400:
            httpError = "Bad Request";
            break;
        case 403:
            httpError = "Access Denied";
            break;
        case 404:
            httpError = "Not Found";
            break;
        case 405:
            httpError = "Method Not Allowed";
            break;
        case 406:
            httpError = "Not Acceptable";
            break;
        case 500:
            httpError = "Internal Server Error";
            break;
    }
    exports.write(res, "error.html", {
        num: num,
        httpError: httpError,
        details: details
    }, num);
};
