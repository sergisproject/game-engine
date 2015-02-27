/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// node modules
var crypto = require("crypto");

// our modules
var config = require("../../config"),
    contentComponentTypes = require("../contentComponentTypes");


// The salt length for pbkdf2 hashing of passwords
var HASH_SALT_LENGTH = 16;
// The number of iterations for pbkdf2 hashing of passwords
var HASH_NUM_ITERATIONS = 10000;
// The derived key length for pbkdf2 hashing of passwords
var HASH_DERIVED_KEY_LENGTH = 30;


// The User model (created in the `module.exports` function below)
var User;


/**
 * Encrypt a password.
 *
 * @param {string} password - The user-provided password to encrypt.
 *
 * @return {Promise.<string>} The encrypted password.
 */
function encryptPassword(password) {
    return new Promise(function (resolve, reject) {
        var randomSalt = crypto.randomBytes(HASH_SALT_LENGTH).toString("base64").substring(0, HASH_SALT_LENGTH),
            numIterations = HASH_NUM_ITERATIONS,
            derivedKeyLength = HASH_DERIVED_KEY_LENGTH;
        
        // Hash the password
        crypto.pbkdf2(password, randomSalt, numIterations, derivedKeyLength, function (err, derivedKey) {
            if (err) {
                reject(err);
                return;
            }
            
            var data = JSON.stringify([randomSalt, numIterations, derivedKeyLength, (new Buffer(derivedKey, "binary")).toString("base64")]);
            resolve(data.slice(1, -1));
        });
    });
}

/**
 * Check an encrypted password.
 *
 * @param {string} password - The user-provided password to check.
 * @param {string} encryptedPassword - The stored encrypted password to check
 *        against.
 *
 * @return {Promise.<boolean>} Whether the passwords match.
 */
function checkPassword(password, encryptedPassword) {
    return new Promise(function (resolve, reject) {
        var data;
        try {
            data = JSON.parse("[" + encryptedPassword + "]");
        } catch (err) {
            reject(err);
            return;
        }
        
        if (data && Array.isArray(data) && data.length == 4 &&
            typeof data[0] == "string" && // random salt
            typeof data[1] == "number" && // number of iterations
            typeof data[2] == "number" && // derived key length
            typeof data[3] == "string") { // derived key
            
            var randomSalt = data[0],
                numIterations = data[1],
                derivedKeyLength = data[2],
                derivedKey = data[3];
            
            // Hash the provided password
            crypto.pbkdf2(password, randomSalt, numIterations, derivedKeyLength, function (err, newDerivedKey) {
                if (err) {
                    reject(err);
                    return;
                }
                
                if ((new Buffer(newDerivedKey, "binary")).toString("base64") === derivedKey) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        } else {
            reject(new Error("Invalid encrypted password."));
        }
    });
}


/**
 * Check a username and password to see if it matches a user account.
 *
 * @param {string} username - The username for the account.
 * @param {string} password - The password for the account.
 *
 * @return {Promise.<?User>} The User matching this account, or null if no
 *         matching user was found.
 */
function checkLoginInfo(username, password) {
    return new Promise(function (resolve, reject) {
        // Find the username
        User.findOne({username: username}, function (err, user) {
            if (err) {
                reject(err);
                return;
            }
            
            // Make sure the username was good
            if (!user) {
                resolve(null);
                return;
            }
            
            // Check password
            user.checkPassword(password).then(function (isTheUserTellingTheTruth) {
                if (isTheUserTellingTheTruth) {
                    // Yay, the user wasn't lying to us!
                    resolve(user);
                } else {
                    // The user was lying to us.
                    resolve(null);
                }
            }, reject);
        });
    });
}


module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    
    // User schema
    var userSchema = new Schema({
        // The username of the user
        username: {
            type: String,
            unique: true,
            required: true
        },

        // The full name of the user
        name: String,

        // The salted and hashed password of the user
        encryptedPassword: String,

        // The games that the user is allowed to play
        allowedGames: [{
            type: Schema.Types.ObjectId,
            ref: "Game"
        }],

        // Data about the games that the user has played
        playedGames: [{
            // The game
            game: {
                type: Schema.Types.ObjectId,
                ref: "Game"
            },

            // Any user variables stored with this user and game combination
            userVars: Schema.Types.Mixed
        }],
        
        // Privileges that the user has
        privileges: {
            // Full admin privileges
            fullAdmin: {
                type: Boolean,
                default: false
            }
        }
    });
    
    
    // User model instance method
    /**
     * Check user account's password.
     *
     * @param {string} password - The password to check.
     *
     * @return {Promise.<boolean>} Whether the password matches the one stored
     *         for the account.
     */
    userSchema.methods.checkPassword = function (password) {
        if (this.encryptedPassword) {
            return checkPassword(password, this.encryptedPassword);
        } else {
            return Promise.resolve(false);
        }
    };
    
    // User model instance method
    /**
     * Set a new password for a user account.
     *
     * @param {string} password - The new password.
     *
     * @return {Promise} Resolved if setting the new password was successful.
     */
    userSchema.methods.setPassword = function (password) {
        var user = this;
        return new Promise(function (resolve, reject) {
            encryptPassword(password).then(function (encryptedPassword) {
                user.encryptedPassword = encryptedPassword;
                user.save(function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            }, reject);
        });
    };
    
    
    // User model static method
    userSchema.statics.checkLoginInfo = checkLoginInfo;
    
    
    // User model
    return (User = mongoose.model("User", userSchema));
};
