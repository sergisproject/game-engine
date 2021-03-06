/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// our modules
var config = require("../../config");


// The GameState model (created in the `module.exports` function below)
var GameState;

// Create the GameState model
module.exports = function (mongoose, extend) {
    var Schema = mongoose.Schema;
    
    // GameState schema
    var gameStateSchema = new Schema({
        // A name for this game state
        name: String,
        
        // The content components that are part of this game state
        contentComponents: [{
            // The geometry of the content component on the game page
            // (percents)
            geometry: {
                left: Number,
                top: Number,
                width: Number,
                height: Number
            },

            // The content component to display in this space
            contentComponent: {
                type: Schema.Types.ObjectId,
                ref: "ContentComponent"
            }
        }],

        // The action sets that can be chosen as part of this game state
        actionSets: [{
            // Whether the actions in this set should be executed asynchronously
            async: {
                type: Boolean,
                default: false
            },
            
            // The actions that are part of this action set
            actions: [{
                type: Schema.Types.ObjectId,
                refs: "Action"
            }]
        }]
    });
    
    
    // GameState model instance method
    /** Get the games that this game state is associated with. */
    gameStateSchema.methods.getGames = function () {
        return findGamesByGameState(this);
    };
    
    
    // GameState model
    return (GameState = mongoose.model("GameState", gameStateSchema));
};


/**
 * Find the games that are associated with a game state.
 * @param {GameState} gameState - The GameState that we are finding games for.
 * @return {Promise.<Array.<Game>>} The games associated with this GameState.
 */
function findGamesByGameState(gameState) {
    return new Promise(function (resolve, reject) {
        //require("../db").models.Game.find({})...
    });
}
