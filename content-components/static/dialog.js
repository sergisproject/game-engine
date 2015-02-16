/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

// REMEMBER:
// sergis.socket ==> the socket.io instance
//                   (sergis.socket.emit(...), sergis.socket.on(...), etc.)
// sergis.error(...)
// sergis.addLoadHandler({function} handler)
// sergis.getUserVar({string} name)
// sergis.setUserVar({string} name, value)

(function () {
    // Put functions and variables here
    
    sergis.addLoadHandler(function () {
        // Put stuff here that should be run after the socket is loaded.
    });
})();
