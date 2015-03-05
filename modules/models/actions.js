/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// our modules
var config = require("../../config"),
    actionTypes = require("../actionTypes");


/*
  NOTES ON ACTION MODELS
  ======================
  - All action models are children of the Action model (schema defined in
    `module.exports` below).

  - Each child of Action must define these instance methods:
      - doAction(state) : Promise
        The state param is a GameSocket.state object (see gameSocketHandler.js).
        The Promise should be resolved with an object with these properties:
          - reloadGameState {boolean} - whether to reload the game state (i.e.
            if it has been changed)
          - socketEvents {Array.<Object>} - Socket events to send to the client.
            Each object should have an `event` (string) and `data` (object) and,
            optionally, a `waitForCallback` (boolean), indicating that it should
            wait for the client to call a callback before continuing to the next
            event.

  - Each child of Action must define these static methods:
      - getDescription() : string
        Returns a general description of the action (could be used in an
        authoring environment).
*/


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
        goToGameStateSchema.methods.doAction = function (state) {
            var that = this;
            return new Promise(function (resolve, reject) {
                state.currentGameState = that.params.nextGameState;
                resolve({
                    reloadGameState: true
                });
            });
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
        
        // Perform the action
        messageContentComponentSchema.methods.doAction = function (state) {
            var that = this;
            return new Promise(function (resolve, reject) {
                resolve({
                    socketEvents: [{
                        event: "messageContentComponent",
                        data: {
                            contentComponent: that.contentComponent._id || that.contentComponent,
                            message: that.message
                        }
                    }]
                });
            });
        };
        
        // A description, used in any sort of authoring environment
        messageContentComponentSchema.statics.getDescription = function () {
            return description;
        };
        
        // messageContentComponent model
        return mongoose.model("messageContentComponent", messageContentComponentSchema);
    }
};
