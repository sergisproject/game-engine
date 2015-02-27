/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// our modules
var config = require("../../config"),
    contentComponentTypes = require("../contentComponentTypes");


// The Game model (created in the `module.exports` function below)
var Game;


module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    
    // Game schema
    var gameSchema = new Schema({
        // The name of the game
        name: {
            type: String,
            unique: true,
            required: true
        },

        // The initial game state that the user starts in (corresponds to an index
        // in gameStates)
        initialGameStateIndex: Number,

        // The game states that make up this game
        gameStates: [{
            type: Schema.Types.ObjectId,
            ref: "GameState"
        }]
    });
    
    
    // Game model
    return (Game = mongoose.model("Game", gameSchema));
};
