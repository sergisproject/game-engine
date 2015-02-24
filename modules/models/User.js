/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// our modules
var config = require("../../config"),
    contentComponentTypes = require("../contentComponentTypes");

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
        password: String,

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

        // Any auth tokens created for the authentication of the user
        authTokens: [{
            type: Schema.Types.ObjectId,
            ref: "AuthToken"
        }]
    });
    
    return mongoose.model("User", userSchema);
};
