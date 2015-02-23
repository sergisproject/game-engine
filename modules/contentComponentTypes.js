/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// node modules
var fs = require("fs"),
    path = require("path");

// required modules

// our modules
var config = require("../config");

module.exports = {
    "basic-html": {
        template: path.join(config.CONTENT_COMPONENTS_TEMPLATES_DIR, "basic-html.html"),
        cssDependencies: [],
        jsDependencies: [
            path.join(config.CONTENT_COMPONENTS_STATIC_DIR, "basic-html.js")
        ]
    },
    
    map: {
        template: path.join(config.CONTENT_COMPONENTS_TEMPLATES_DIR, "map.html"),
        cssDependencies: [],
        jsDependencies: [
            path.join(config.CONTENT_COMPONENTS_STATIC_DIR, "map.js")
        ]
    },
    
    dialog: {
        template: path.join(config.CONTENT_COMPONENTS_TEMPLATES_DIR, "dialog.html"),
        cssDependencies: [],
        jsDependencies: [
            path.join(config.CONTENT_COMPONENTS_STATIC_DIR, "dialog.js")
        ]
    }
};
