/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// our modules
var config = require("../../config"),
    actionTypes = require("../actionTypes");


// The Action model (created in the `module.exports` function below)
var Action;


module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    
    // Action schema
    var actionSchema = new Schema({
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
    
    
    // Action model
    return (Action = mongoose.model("Action", actionSchema));
};
