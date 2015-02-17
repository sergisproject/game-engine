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


// By default, use the normal config.TEMPLATES_DIR
module.exports = new Writer(config.TEMPLATES_DIR);
// But, still give the ability to create other Writers for other template dirs
module.exports.Writer = Writer;


/**
 * A writer for writing templates from a directory.
 *
 * @param {string} [root] - The root of the templates.
 * @param {string} [errorRoot=root] - The root for error message templates.
 * @param {string} [errorTemplateName="error.html"] - The name of the generic
 *        error message template.
 * @param {Object.<number, string>} [errorTemplateNamesByStatus] - The names of
 *        error message templates for certain HTTP error messages. If an HTTP
 *        error doesn't have a corresponding template name here, it uses the
 *        generic errorTemplateName above.
 */
function Writer(root, errorRoot, errorTemplateName, errorTemplateNamesByStatus) {
    this.root = root || "";
    this.errorRoot = errorRoot || root;
    this.errorTemplateName = errorTemplateName || "error.html";
    this.errorTemplateNamesByStatus = errorTemplateNamesByStatus || {};
}

/**
 * Render a template and get its contents.
 *
 * @param {string} template - The name of the template to use.
 * @param {object} vars - Variables for the template.
 * @param {Function} callback - Function to call with 2 arguments: 
 *                   The error (if any), and
 *                   The data.
 */
Writer.prototype.render = function (template, vars, callback) {
    // Set up mu
    if (config.DEVELOPMENT) {
        mu.clearCache();
    }
    
    // Render the template
    var stream = mu.compileAndRender(path.join(this.root, template), vars);
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
Writer.prototype.write = function (res, template, vars, status, headers) {
    if (typeof res != "object" || !res) throw "Invalid res.";
    if (typeof template != "string" || !template) throw "Invalid template.";
    
    // Make sure variables are good
    if (status && typeof status == "object") {
        headers = status;
        status = null;
    }
    if (!headers || typeof headers != "object") headers = {};
    if (!headers["Content-Type"]) headers["Content-Type"] = "text/html";
    if (!headers["Cache-Control"]) headers["Cache-Control"] = "no-cache";
    
    // Write the template to the stream
    writeToStream(res, path.join(this.root, template), vars, status, headers);
};

/**
 * Write an error page to an output stream.
 *
 * @param res - The Express response object.
 * @param {number} status - The HTTP error number.
 * @param {string} [details] - Details about the error.
 */
Writer.prototype.writeError = function (res, status, details) {
    if (typeof res != "object" || !res) throw "Invalid res.";
    if (typeof status != "number" || !status) throw "Invalid HTTP status.";
    
    // Set up template variables
    var httpError = "";
    switch (status) {
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
    
    var templateName = this.errorTemplateNamesByStatus[status] || this.errorTemplateName;
    writeToStream(res, path.join(this.errorRoot, templateName), {
        num: status,
        httpError: httpError,
        details: details
    }, status, {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache"
    });
};


/**
 * Write a template to an output stream.
 *
 * @param res - The Express response object.
 * @param {string} templatePath - The full path to the template.
 * @param {object} vars - The variables for the template.
 * @param {number} status - The HTTP status.
 * @param {object} headers - The HTTP headers.
 */
function writeToStream(res, templatePath, vars, status, headers) {
    // Set up mu
    if (config.DEVELOPMENT) {
        mu.clearCache();
    }
    // Write the status and headers
    res.writeHead(status || 200, headers || {});
    // Render the template
    mu.compileAndRender(templatePath, vars || {}).pipe(res);
}
