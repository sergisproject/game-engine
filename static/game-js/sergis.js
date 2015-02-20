/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

var sergis = {
    // Set here:
    //socket
    //error()
    //addLoadHandler()
    //getUserVar()
    //setUserVar()
    
    // Set in other files:
    //game.*
};

// Use Promise polyfill if needed
if (typeof Promise == "undefined") {
    Promise = ES6Promise.Promise;
}

// Polyfill window.location.origin if needed
if (!window.location.origin) {
    window.location.origin = window.location.protocol + "//" +
        window.location.hostname +
        (window.location.port ? ":" + window.location.port: "");
}

// Make sure console.log is a thing (and console.error)
if (typeof console == "undefined") console = {};
if (typeof console.log != "function") console.log = function () {};
if (typeof console.error != "function") console.error = console.log;

(function () {
    /** Load handlers, used by sergis.addLoadHandler */
    var loadHandlers = [];
    
    /**
     * Report an error to the console and possibly alert the user.
     * Commonly used as the handler for rejected Promises.
     */
    sergis.error = function () {
        // No matter what, we better not throw anything
        try {
            console.error.apply(console, arguments);
            if (arguments.length > 0) {
                if (typeof arguments[0] == "string") {
                    // It's a string; alert the user.
                    alert("Error: " + arguments[0]);
                } else if (arguments[0] instanceof Error) {
                    // We have an Error; alert the user.
                    var err = arguments[0];
                    alert("SerGIS Error: " + err.name + ":\n" + err.message +
                        (err.stack ? "\n\n" + err.stack : ""));
                }
            }
        } catch (err) {}
    }
    
    /**
     * Add a handler to be run once the page is loaded and the socket is
     * initialized.
     */
    sergis.addLoadHandler = function (handler) {
        loadHandlers.push(handler);
    };
    
    /**
     * Run all the load handlers and make sure any new ones run right away.
     */
    function runLoadHandlers() {
        while (loadHandlers.length) {
            loadHandlers.shift()();
        }
        // And, if someone tries to add another, just run it right away
        sergis.addLoadHandler = function (handler) {
            handler();
        };
        // Now, tell the server that we're ready
        sergis.socket.emit("contentLoaded");
    }
    
    /** Window load handler */
    function init() {
        // Load socket.io
        console.log("Loading socket...");
        sergis.socket = io.connect(sergis.socketLocation);
        sergis.socket.on("connecting", function () {
            console.log("Connecting to socket server...");
        });
        sergis.socket.on("connect", function () {
            console.log("Connected to socket server");
            // Now that we're all connected, run load handlers
            runLoadHandlers();
        });
        
        sergis.socket.on("connect_failed", function () {
            sergis.error("Connection to socket server failed.");
        });
        
        sergis.socket.on("disconnect", function () {
            console.log("Disconnected from socket server");
        });
        sergis.socket.on("error", function (err) {
            console.log("Error connecting to socket server: ", err);
        });
        sergis.socket.on("reconnect", function () {
            console.log("Reconnected to socket server");
        });
        sergis.socket.on("reconnecting", function (num) {
            console.log("Reconnecting to socket server... (attempt " + num + ")");
        });
        sergis.socket.on("reconnect_error", function (err) {
            console.log("Error reconnecting to socket server: ", err);
        });
        sergis.socket.on("reconnect_failed", function () {
            console.log("Failed to reconnect to socket server");
        });
    }
    
    window.addEventListener("load", init, false);
})();
