/*
    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
*/

(function () {
    // ArcGIS units for different things
    var arcgis_units = {
        length: {
            "foot": "feet",
            "kilometer": "kilometers",
            "meter": "meters",
            "nautical_mile": "nautical miles",
            "statute_mile": "miles",
            "us_nautical_mile": "US nautical miles"
        },
        length_order: ["kilometer", "meter", "statute_mile", "nautical_mile", "us_nautical_mile", "foot"],
        length_unit: "kilometer",
        
        area: {
            "acres": "acres",
            "ares": "ares",
            "hectacres": "hectacres",
            "square_centimeters": "square centimeters",
            "square_decimeters": "square decimeters",
            "square_feet": "square feet",
            "square_inches": "square inches",
            "square_kilometers": "square kilometers",
            "square_meters": "square meters",
            "square_miles": "square miles",
            "square_millimeters": "square millimeters",
            "square_yards": "square yards"
        },
        area_order: ["square_kilometers", "square_meters", "acres", "ares", "hectacres", "square_miles", "square_yards", "square_feet", "square_inches", "square_decimeters", "square_centimeters", "square_millimeters"],
        area_unit: "square_kilometers"
    };
    
    // A cache of things that have been "require"d.
    var api = {};
    
    // "global map"
    var gMap;
    
    // "global toolbar"
    var gToolbar;
    
    // "global geometry service"
    var gSvc;
    
    // The index of the last geometry item drawn by the user.
    // Corresponds to drawnObjects["userDrawing_" + index].
    var userDrawingIndex = -1;
    
    // A map of geometry items (points, lines, polygons) that have been drawn
    // through map actions (key is internal ID of what we drew, value is object
    // with 3 arrays: `geometries`, `symbols`, and `graphics`).
    var drawnObjects = {};
    
    /**
     * Initialize the map.
     *
     * @return {Promise}
     */
    function init() {
        return new Promise(function (resolve, reject) {
            // Load everything we need from the ArcGIS API
            initRequire().then(function () {
                // Initialize the map
                var mapContainer = document.getElementById("map-container");
                mapContainer.innerHTML = "";
                // Make a sub-container
                var mapElem = document.createElement("div");
                mapElem.id = "map-container-ARCGIS_API";
                mapElem.style.margin = "0";
                mapElem.style.padding = "0";
                mapElem.style.height = "100%";
                mapContainer.appendChild(mapElem);
                
                // Get all the map information together
                var info = {
                    center: [sergis.content.data.map.longitude, sergis.content.data.map.latitude],
                    zoom: sergis.content.data.map.zoom,
                    logo: false,
                    // Default basemap:
                    basemap: sergis.content.data.map.basemap || "streets"
                };
                
                /*
                var mapLayersPromise;
                // Check layers
                if (sergis.content.data.map.layers && sergis.content.data.map.layers.length) {
                    mapLayersPromise = loadMapLayers(sergis.content.data.map.layers);
                }
                */
                
                // Initialize the geometry service
                gSvc = new api.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
                
                // Create the map
                gMap = new api.Map("map-container-ARCGIS_API", info);
                gMap.on("load", function (event) {
                    // Initialize the drawing ability
                    gToolbar = new api.Draw(gMap);
                    gToolbar.on("draw-end", onDrawEnd);
                    
                    /*
                    // If we have map layers, add them
                    if (mapLayersPromise) {
                        mapLayersPromise.then(function (dynamicLayers) {
                            for (var i = 0; i < dynamicLayers.length; i++) {
                                gMap.addLayer(dynamicLayers[i]);
                                // Make it invisible (after an extremely start timeout so it starts loading)
                                hideDynamicMapLayer(dynamicLayers[i]);
                            }
                            
                            // Finally, we're done
                            resolve();
                        }, reject).catch(sergis.error);
                    } else {
                        // No map layers; we're done
                        resolve();
                    }
                    */
                    resolve();
                });
            }, reject).catch(sergis.error);
        });
    }
    
    
    // Add load handler for init
    sergis.addLoadHandler(function () {
        init().then(function () {
            console.log("LOADED!");
        }, sergis.error).catch(sergis.error);
    });
    
    
    
    
    /**
     * Handle when a drawing is done being drawn.
     */
    function onDrawEnd(event) {
        var index = ++userDrawingIndex,
            geometry = event.geometry;
        // Draw the object on the map
        var style = {};
        checkDrawStyle(style);
        drawObjects("userDrawing_" + index, [geometry], style);
        // Deactivate the drawing and put the zoom slider back
        gToolbar.deactivate();
        gMap.showZoomSlider();
        // Depending on the type of drawing, report a status message back to the user
        if (geometry.type == "point") {
            alert("Latitude: " + geometry.getLatitude().toFixed(3) + ", Longitude: " + geometry.getLongitude().toFixed(3));
            /*
            sergis.main.status({
                type: "text",
                value: "Latitude: " + geometry.getLatitude().toFixed(3) + ", Longitude: " + geometry.getLongitude().toFixed(3)
            });
            */
        } else if (geometry.type == "polygon") {
            findArea(geometry);
        } else {
            findLength(geometry);
        }
    }
    
    /**
     * Find the area of a polygon.
     *
     * @param geometry - The polygon.
     * @param {boolean} alreadySimplified - Whether the geometry has already
     *        been simplified.
     */
    function findArea(geometry, alreadySimplified) {
        var unit = sergis_units.area_unit;
        var after_simplification = function (simplifiedGeometries) {
            // Set up the parameters for the area operation
            var params = new api.AreasAndLengthsParameters();
            // TODO: We need to be able to let the user choose the unit.
            params.areaUnit = api.GeometryService["UNIT_" + unit.toUpperCase()];
            // "planar", "geodesic", "preserveShape"
            params.calculationType = "geodesic";
            params.polygons = simplifiedGeometries;
            gSvc.areasAndLengths(params, function (result) {
                makeUnitStatus(result.areas[0], unit, geometry);
            });
        };
        if (alreadySimplified) {
            after_simplification([geometry]);
        } else {
            gSvc.simplify([geometry], function (simplifiedGeometries) {
                after_simplification(simplifiedGeometries);
            });
        }
    }
    
    /**
     * Find the length of a polyline.
     *
     * @param geometry - The polyline.
     */
    function findLength(geometry) {
        var unit = sergis_units.length_unit;
        // Set up the parameters for the length operation
        var params = new api.LengthsParameters();
        // TODO: We need to be able to let the user choose the unit.
        params.lengthUnit = api.GeometryService["UNIT_" + unit.toUpperCase()];
        params.geodesic = true;
        params.polylines = [geometry];
        gSvc.lengths(params, function (result) {
            makeUnitStatus(result.lengths[0], unit, geometry);
        });
    }
    
    /**
     * Check one of our DrawStyle object and put in default values for missing
     * ones (modifications done in place).
     *
     * @param {object} style - One of our DrawStyle objects (see top of file).
     */
    function checkDrawStyle(style) {
        // *** HERE ARE THE DEFAULT STYLE VALUES ***
        if (!style.dotStyle) style.dotStyle = "circle";
        if (!style.dotColor) style.dotColor = [0, 255, 0, 0.25];
        if (!style.lineStyle) style.lineStyle = "Solid";
        if (!style.lineColor) style.lineColor = [255, 0, 0];
        if (!style.lineWidth) style.lineWidth = 2;
        if (!style.fillColor) style.fillColor = [255, 0, 0, 0.25];
        if (!style.fillStyle) style.fillStyle = "solid";
    }
    
    /**
     * Draw some geometry on the map.
     *
     * @param {string} drawnObjectName - The name of the thing to draw (its
     *        data will be stored in drawnObjects[drawnObjectName]).
     * @param {array} geometries - The geometry object(s)
     *        ("esri/geometry/Geometry") representing the object(s) to draw.
     * @param {object} style - One of our DrawStyle objects (see top of file).
     */
    function drawObjects(drawnObjectName, geometries, style) {
        var o = drawnObjects[drawnObjectName] = {};
        o.geometries = geometries;
        o.symbols = [];
        o.graphics = [];
        // Go through each geometry and add it to the map
        for (var i = 0; i < o.geometries.length; i++) {
            // Make the actual map symbol
            switch (o.geometries[i].type) {
                case "point":
                    o.symbols[i] = new api.SimpleMarkerSymbol(
                        api.SimpleMarkerSymbol["STYLE_" + style.dotStyle.toUpperCase()],
                        10,
                        new api.SimpleLineSymbol(
                            api.SimpleLineSymbol["STYLE_" + style.lineStyle.toUpperCase()],
                            new api.Color(style.lineColor),
                            1
                        ),
                        new api.Color(style.dotColor)
                    );
                    break;
                case "polyline":
                    o.symbols[i] = new api.SimpleLineSymbol(
                        api.SimpleLineSymbol["STYLE_" + style.lineStyle.toUpperCase()],
                        new api.Color(style.lineColor),
                        style.lineWidth
                    );
                    break;
                case "polygon":
                    o.symbols[i] = new api.SimpleFillSymbol(
                        api.SimpleFillSymbol["STYLE_" + style.fillStyle.toUpperCase()],
                        new api.SimpleLineSymbol(
                            api.SimpleLineSymbol["STYLE_" + style.lineStyle.toUpperCase()],
                            new api.Color(style.lineColor),
                            style.lineWidth
                        ),
                        new api.Color(style.fillColor)
                    );
                    break;
            }
            
            // Add the symbol to the map
            o.graphics[i] = new api.Graphic(o.geometries[i], o.symbols[i]);
            gMap.graphics.add(o.graphics[i]);
        }
    }
    
    /**
     * Draw a buffer on the map.
     * (Called by frontend.actions.buffer)
     *
     * @param bufferedGeometries - The buffered geometries.
     * @param {object} style - One of our DrawStyle objects (see top of file).
     */
    function drawBuffer(bufferedGeometries, style) {
        var symbol = new api.SimpleFillSymbol(
            api.SimpleFillSymbol["STYLE_" + style.fillStyle.toUpperCase()],
            new api.SimpleLineSymbol(
                api.SimpleLineSymbol["STYLE_" + style.lineStyle.toUpperCase()],
                new api.Color(style.lineColor),
                2
            ),
            new api.Color(style.fillColor)
        );
        
        for (var graphic, i = 0; i < bufferedGeometries.length; i++) {
            graphic = new api.Graphic(bufferedGeometries[i], symbol);
            gMap.graphics.add(graphic);
        }
    }
    
    // A map of ArcGIS code names for different parts of the API, mapped to the
    //name we use when loading them into `api`.
    var toBeRequired = {
        "esri/map": "Map",
        "esri/graphic": "Graphic",
        "esri/Color": "Color",
        
        "esri/geometry/Geometry": "Geometry",
        "esri/geometry/Point": "Point",
        "esri/geometry/Multipoint": "Multipoint",
        "esri/geometry/Polygon": "Polygon",
        "esri/geometry/Polyline": "Polyline",
        
        "esri/tasks/GeometryService": "GeometryService",
        "esri/tasks/BufferParameters": "BufferParameters",
        "esri/tasks/AreasAndLengthsParameters": "AreasAndLengthsParameters",
        "esri/tasks/LengthsParameters": "LengthsParameters",
        
        "esri/layers/ArcGISDynamicMapServiceLayer": "ArcGISDynamicMapServiceLayer",
        "esri/layers/ImageParameters": "ImageParameters",
        
        "esri/toolbars/draw": "Draw",
        
        "esri/symbols/SimpleMarkerSymbol": "SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol": "SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol": "SimpleFillSymbol"
    };
    
    /**
     * Require all the stuff that we'll need, if we haven't already.
     *
     * @return {Promise}
     */
    function initRequire() {
        return new Promise(function (resolve, reject) {
            var requireArgs = [],
                requireNames = [];
            for (var prop in toBeRequired) {
                if (toBeRequired.hasOwnProperty(prop) && toBeRequired[prop]) {
                    requireArgs.push(prop);
                    requireNames.push(toBeRequired[prop]);
                    // We don't want to require it more than once
                    delete toBeRequired[prop];
                }
            }
            if (requireArgs.length > 0) {
                require(requireArgs, function () {
                    for (var i = 0; i < arguments.length; i++) {
                        api[requireNames[i]] = arguments[i];
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
})();
