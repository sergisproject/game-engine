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

/**
 * Set a different root temporarily, or reset the root to its default.
 * If a new temporary root is set, it will be reset back to the default after
 * the next writer.* function is called.
 *
 * @param {string} [root] - The new root (or leave undefined to reset the root).
 */
exports.setTemporaryRoot = function (root) {
    if (root) {
        mu.root = root;
    } else {
        mu.root = config.TEMPLATES_DIR;
    }
};

// Set the default templates directory now
exports.setTemporaryRoot();

/**
 * Render a template and get its contents.
 *
 * @param {string} template - The name of the template to use.
 * @param {object} vars - Variables for the template.
 * @param {Function} callback - Function to call with 2 arguments: 
 *                   The error (if any), and
 *                   The data.
 */
exports.render = function (template, vars, callback) {
    if (config.DEVELOPMENT) {
        mu.clearCache();
    }
    var stream = mu.compileAndRender(template, vars);
    var data = "";
    stream.on("data", function (chunk) {
        data += chunk;
    });
    stream.on("error", function (err) {
        callback(err);
    });
    stream.on("end", function () {
        callback(null, data);
    });
    
    // Reset any possible temporary root that might have existed
    exports.setTemporaryRoot();
};

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
    
    // Reset any possible temporary root that might have existed
    exports.setTemporaryRoot();
};

/**
 * Write an error page to an output stream.
 *
 * @param res - The Express response object.
 * @param {number} num - The HTTP error number.
 * @param {string} [details] - Details about the error.
 */
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
    
    // Any possible temporary root that might have existed will be reset in exports.write.
};
