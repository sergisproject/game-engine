/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

sergis.game = {
    // Set here:
    //getUserVar()
    //setUserVar()
    //init()
};

(function () {
    // The game name of the game that we are playing (set in `init`)
    var gameName;
    
    // The auth token to use for requests (set in `init`)
    var authToken;
    
    
    /**
     * Get the value of a variable that is part of the User State.
     *
     * @param {string} name - The name of the variable.
     *
     * @return {Promise} The value of the variable (could be any
     * JSON-encodable type).
     */
    sergis.game.getUserVar = function (name) {
        return new Promise(function (resolve, reject) {
            sergis.socket.emit("getUserVar", {
                name: name
            }, function (err, value) {
                if (err) {
                    reject(err);
                } else {
                    resolve(value);
                }
            });
        });
    };
    
    /**
     * Set the value of a variable that is part of the User State.
     *
     * @param {string} name - The name of the variable.
     * @param value - The value of the variable (can be any JSON-encodable
     *        type).
     *
     * @return {Promise} Resolved if the variable was saved successfully.
     */
    sergis.game.setUserVar = function (name, value) {
        return new Promise(function (resolve, reject) {
            sergis.socket.emit("setUserVar", {
                name: name,
                value: value
            }, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };
    
    /**
     * Initialize the game variables.
     *
     * @param {string} _gameName - The name of the game that we are playing.
     * @param {string} _authToken - The auth token to use for requests.
     */
    sergis.game.init = function (_gameName, _authToken) {
        // This function can only be called once
        sergis.game.init = function () {};
        
        // Set game variables
        gameName = _gameName;
        authToken = _authToken;
        
        // Start the game once everything is loaded
        sergis.addLoadHandler(startGame);
    };
    
    
    /**
     * Actually load and start the game.
     */
    function startGame() {
        alert("Starting game " + gameName + "!\nAuth token: " + authToken);
        sergis.socket.emit("ready", {
            gameName: gameName,
            authToken: authToken
        }, function (err, contentComponents) {
            if (err) {
                alert("ERROR FROM SERVER: " + err);
            } else {
                alert("JSON Response from server: " + JSON.stringify(contentComponents));
            }
        });
    }
})();
