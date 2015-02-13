/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

/**
 * Functions to call right before exiting.
 * @type Array.<Function>
 */
var exitHandlers = [];
exports.exitHandlers = exitHandlers;

/**
 * Set up exit cleanup.
 * (NOTE: This will prevent the node process from exiting until it is
 * explicitely told to exit.)
 */
exports.init = function () {
    // So that the program will not close instantly when Ctrl+C is pressed, etc.
    process.stdin.resume();

    // Catch app closing
    process.on("exit", function () {
        console.log("");
        console.log("Exiting...");
        exitHandlers.forEach(function (item) {
            try {
                item();
            } catch (err) {
                console.error("Error running exit handler: ", err);
            }
        });
        return true;
    });

    // Catch Ctrl+C event
    process.on("SIGINT", function () {
        console.log("");
        console.log("Caught SIGINT...");
        process.exit(2);
    });
}
