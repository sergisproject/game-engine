/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// our modules
var config = require("../../config");

module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    
    // AuthToken schema
    var authTokenSchema = new Schema({
        // The token
        token: String,

        // The date that the token was created
        dateCreated: {
            type: Date,
            default: Date.now
        },

        // The date that the token was last accessed
        dateAccessed: {
            type: Date,
            default: Date.now
        }
    });
    
    return mongoose.model("AuthToken", authTokenSchema);
};
