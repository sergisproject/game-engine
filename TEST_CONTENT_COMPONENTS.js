////////////////////////////////////////////////////////////////////////////////
module.exports = {
    /*
    id: {
        type: "Content Component type here",
        data: {
            // Content Component data here
        },
        vars: {
            // Content Component template vars here
        }
    }
    */
    
    1: {
        type: "basic-html",
        data: {},
        vars: {
            html: "<strong><i>SOME</i> HTML</strong>",
            js: 'document.body.style.backgroundColor = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ")";'
        }
    },
    
    2: {
        type: "basic-html",
        data: {},
        vars: {
            html: "<strong><i>SOME</i> HTML</strong> #2",
            js: 'document.body.style.backgroundColor = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ")";'
        }
    },
    
    3: {
        type: "basic-html",
        data: {},
        vars: {
            html: "<strong><i>SOME</i> HTML</strong> #3",
            js: 'document.body.style.backgroundColor = "rgb(" + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + "," + Math.floor(Math.random()*255) + ")";'
        }
    },
    
    4: {
        type: "map",
        data: {
            map: {
                latitude: 0,
                longitude: 0,
                zoom: 5,
                basemap: "",
                layers: []
            }
        },
        vars: {},
        cssDependencies: [
            "http://js.arcgis.com/3.11/esri/css/esri.css"
        ],
        jsDependencies: [
            "http://js.arcgis.com/3.11/"
        ]
    },
    
    5: {
        type: "dialog",
        data: {},
        vars: {}
    }
};
////////////////////////////////////////////////////////////////////////////////
