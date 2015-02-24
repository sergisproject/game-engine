/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// node modules
var crypto = require("crypto");

// our modules
var config = require("../../config");


// The length of the random parts of our auth tokens
var TOKEN_LENGTH = 14;


/**
 * Generate a random, pretty guaranteed unique auth token.
 */
function generateToken() {
    return crypto.randomBytes(TOKEN_LENGTH)
        .toString("base64")
        .substring(0, TOKEN_LENGTH)
        // Turn obscure base64 characters into less obscure characters
        .replace(/+/g, ".")
        .replace(/\//g, ",")
        // Add the current time for more uniqueness
        + (new Date()).getTime().toString(36);
}


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
    
    authTokenSchema.methods.generateToken = function () {
        return (this.token = generateToken());
    };
    
    return mongoose.model("AuthToken", authTokenSchema);
};
