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
    
    // ContentComponent schema
    var contentComponentSchema = new mongoose.Schema({
        // The type of the content component (must correspond to one of the Content
        // Component types in contentComponentTypes.js)
        contentComponentType: {
            type: String,
            validator: contentComponentTypes.hasOwnProperty.bind(contentComponentTypes),
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
    
    return mongoose.model("ContentComponent", contentComponentSchema);
};
