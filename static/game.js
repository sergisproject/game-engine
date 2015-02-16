/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

(function () {
    function makeContentIframe(content) {
        var iframe = document.createElement("iframe");
        iframe.style.position = "absolute";
        for (var cssName in content.geometry) {
            if (content.geometry.hasOwnProperty(cssName)) {
                iframe.style[cssName] = content.geometry[cssName];
            }
        }
        iframe.setAttribute("src", "/content/" + content.content_id);
        document.getElementById("main-wrapper").appendChild(iframe);
    }
    
    sergis.addLoadHandler(function () {
        for (var i = 0; i < sergis.game.contentComponents.length; i++) {
            makeContentIframe(sergis.game.contentComponents[i]);
        }
    });
})();
