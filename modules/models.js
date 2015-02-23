/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// node modules
var fs = require("fs"),
    path = require("path");

// required modules
var mongoose = require("mongoose"),
    Schema = mongoose.Schema; // (shortcut)

// our modules
var config = require("../config"),
    actionTypes = require("./actionTypes"),
    contentComponentTypes = require("./contentComponentTypes");


/** All of the schemas that we have */
var schemas = {};


/** Content Component schema */
schemas.contentComponent = new Schema({
    // The type of the content component (must correspond to one of the Content
    // Component types in contentComponentTypes.js)
    contentComponentType: {
        type: String,
        validator: contentComponentTypes.hasOwnProperty.bind(contentComponents),
        required: true
    },
    
    // The data for this content component
    data: Schema.Types.Mixed,
    
    // The template variables for this content component
    vars: Schema.Types.Mixed,
    
    // Any extra CSS stylesheet URLs for this content component
    cssDependencies: [String],
    
    // Any extra JS script URLs for this content component
    jsDependencies: [String]
});


/** Action schema */
schemas.action = new Schema({
    // The type of the action (must correspond to one of the Action types in
    // actionTypes.js)
    actionType: {
        type: String,
        validator: actionTypes.hasOwnProperty.bind(actionTypes),
        required: true
    },
    
    // The data for this action
    data: Schema.Types.Mixed
});


/** Game State schema */
schemas.gameState = new Schema({
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
        contentComponent: schemas.contentComponent
    }],
    
    // The action sets that can be chosen as part of this game state
    actionSets: [{
        // The actions that are part of this action set
        actions: [schemas.action]
    }]
});


/** Game schema */
schemas.game = new Schema({
    // The name of the game
    name: {
        type: String,
        unique: true,
        required: true
    },
    
    // The initial game state that the user starts in (corresponds to an index
    // in gameStates)
    initialGameStateIndex: number,
    
    // The game states that make up this game
    gameStates: [schemas.gameState]
});


/** User schema */
schemas.user = new Schema({
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
    allowedGames: [schemas.game],
    
    // Data about the games that the user has played
    playedGames: [{
        // The game
        game: schemas.game,
        
        // Any user variables stored with this user and game combination
        userVars: Schema.Types.Mixed
    }],
    
    // Any auth tokens created for the authentication of the user
    authTokens: [{
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
    }]
});

