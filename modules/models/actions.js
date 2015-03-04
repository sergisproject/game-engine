/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// our modules
var config = require("../../config"),
    actionTypes = require("../actionTypes");


// The Action schema (created in the `module.exports` function below)
var actionSchema;

// Child models (i.e. actual actions)
var actions = {};

// Create the Action model and all its children
module.exports = function (mongoose, extend) {
    var Schema = mongoose.Schema;
    
    // Action schema
    actionSchema = new Schema({
        // Parameters for the action
        params: {}
    }, { discriminatorKey : "_type" });
    
    // Make each action model
    for (var actionName in actionModelConstructors) {
        if (actionModelConstructors.hasOwnProperty(actionName)) {
            actions[actionName] = actionModelConstructors[actionName](mongoose, Schema);
        }
    }
    
    // Return all the actions
    return actions;
};


/**
 * Constructors for the models for the different actions (children of "Action").
 * The keys are the names of the actions, and the values are the constructors
 * to create a model for each action.
 * @type {Object.<string, Function>}
 */
var actionModelConstructors = {
    "goToGameState": function (mongoose, Schema) {
        var description = "This action takes the user to another game " +
            "state, with a new set of content components, etc.";
        
        // goToGameState schema
        var goToGameStateSchema = actionSchema.extend({
            // Parameters for the goToGameState action
            params: {
                nextGameState: {
                    type: Schema.Types.ObjectId,
                    ref: "GameState"
                }
            }
        });
        
        // Perform the action
        goToGameStateSchema.methods.doAction = function () {
            
        };
        
        // A description, used in any sort of authoring environment
        goToGameStateSchema.statics.getDescription = function () {
            return description;
        };
        
        // goToGameState model
        return mongoose.model("goToGameState", goToGameStateSchema);
    },
    
    
    "messageContentComponent": function (mongoose, Schema) {
        var description = "This action sends a message to an open content " +
            "component in the current game state. If the content component " +
            "is not in the current game state, then the message is ignored.";
        
        // messageContentComponent schema
        var messageContentComponentSchema = actionSchema.extend({
            // Parameters for the messageContentComponent action
            params: {
                contentComponent: {
                    type: Schema.Types.ObjectId,
                    ref: "ContentComponent",
                    required: true
                },
                
                message: {
                    type: String,
                    required: true
                }
            }
        });
        
        // A description, used in any sort of authoring environment
        messageContentComponentSchema.statics.getDescription = function () {
            return description;
        };
        
        // messageContentComponent model
        return mongoose.model("messageContentComponent", messageContentComponentSchema);
    }
};
