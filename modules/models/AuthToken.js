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


// The AuthToken model (created in the `module.exports` function below)
var AuthToken;

// Create the AuthToken model
module.exports = function (mongoose, extend) {
    var Schema = mongoose.Schema;
    
    // AuthToken schema
    var authTokenSchema = new Schema({
        // The token
        token: {
            type: String,
            unique: true
        },
        
        // Any old tokens for this session
        oldTokens: [{
            type: String
        }],
        
        // The user associated with this token (if any)
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        
        // Whether the session associated with this token is a super-admin
        // session (see config.js for details)
        superAdmin: {
            type: Boolean,
            default: false
        },
        
        // Data about games played with this session (only used if no user is
        // logged in)
        // keys: game IDs, values: objects
        playedGames: Schema.Types.Mixed,

        // The date that the session was created
        sessionCreated: {
            type: Date,
            default: Date.now
        },
        
        // The date that the current token was created
        tokenCreated: {
            type: Date
        },

        // The date that the session/token was last accessed
        lastAccessed: {
            type: Date,
            default: Date.now
        }
    });
    
    
    // AuthToken model instance method
    authTokenSchema.methods.generateToken = function () {
        if (this.token) {
            this.oldTokens.push(this.token);
        }
        this.tokenCreated = Date.now();
        return (this.token = generateToken());
    };
    
    
    // AuthToken model static method
    authTokenSchema.statics.checkTokenFromReq = checkTokenFromReq;
    
    
    // AuthToken model
    return (AuthToken = mongoose.model("AuthToken", authTokenSchema));
};


/**
 * Generate a random, pretty guaranteed unique auth token.
 */
function generateToken() {
    return crypto.randomBytes(TOKEN_LENGTH)
        .toString("base64")
        .substring(0, TOKEN_LENGTH)
        // Turn obscure base64 characters into less obscure characters
        .replace(/\+/g, ".")
        .replace(/\//g, ",")
        // Add the current time for more uniqueness
        + (new Date()).getTime().toString(36);
}

/**
 * Check for the presence of an auth token in an Express request. If one doesn't
 * exist (or is invalid), generate a new one.
 *
 * @param req - The Express request object.
 * @param {boolean} regenerateToken - Whether to regenerate the token if it
 *        already exists.
 *
 * @return {Promise.<AuthToken>} The AuthToken instance.
 */
function checkTokenFromReq(req, regenerateToken) {
    return new Promise(function (resolve, reject) {
        var generateNewToken = function () {
            var authToken = new AuthToken();
            authToken.generateToken();
            authToken.save(function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(authToken);
            });
        };
        
        if (req.signedCookies.t) {
            // Check the token
            AuthToken.findOne({token: req.signedCookies.t}).populate("user").exec(function (err, authToken) {
                if (authToken) {
                    // We're good!
                    // Should we regenerate token?
                    if (regenerateToken) {
                        // Generate a new token (practically just for fun)
                        authToken.generateToken();
                    }
                    // Set the last accessed date
                    authToken.lastAccessed = Date.now();
                    // Save everything
                    authToken.save(function (err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(authToken);
                    });
                } else {
                    // No good; generate a new one
                    generateNewToken();
                }
            });
        } else {
            generateNewToken();
        }
    });
}