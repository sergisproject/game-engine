/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// node modules
var fs = require("fs"),
    path = require("path");

// required modules
var router = require("express").Router();

// our modules
var config = require("../../config");

// Handler for GET requests to /content/CONTENT ID HERE
router.get("/:id", function (req, res) {
    res.end("Content handler for id " + req.params.id);
});

// Export the router
module.exports = router;
