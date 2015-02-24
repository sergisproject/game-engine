/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// our modules
var config = require("../../config");

module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    
    // GameState schema
    var gameStateSchema = new Schema({
        // The content components that are part of this game state
        contentComponents: [{
            // The geometry of the content component on the game page (CSS values)
            geometry: {
                left: String,
                right: String,
                top: String,
                width: String,
                height: String
            },

            // The content component to display in this space
            contentComponent: {
                type: Schema.Types.ObjectId,
                ref: "ContentComponent"
            }
        }],

        // The action sets that can be chosen as part of this game state
        actionSets: [{
            // The actions that are part of this action set
            actions: [{
                type: Schema.Types.ObjectId,
                refs: "Action"
            }]
        }]
    });
    
    return mongoose.model("GameState", gameStateSchema);
};
