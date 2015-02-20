////////////////////////////////////////////////////////////////////////////////
module.exports = {
    // Game name
    "testgame": {
        // The name of the game (again)
        // (This is quite repetitive when stored in this way, but when using a
        // database in the future, it should be stored in a property like this)
        name: "testgame",
        
        // The initial game state that the user starts in
        // (corresponds to an index in the `gameStates` array)
        initialGameStateIndex: 0,
        
        // The game states for this game
        gameStates: [
            // The first game state (index 0)
            {
                // The content components that are part of this game state
                contentComponents: [
                    {
                        // The css dimensions for this content component's container
                        // NOTE: Maybe we should find a better way to define this...
                        css: {
                            left: "0",
                            top: "0",
                            width: "100%",
                            height: "100px"
                        },
                        // The ID of this content component, corresponding to
                        // something in the TEST_CONTENT_COMPONENTS file
                        content_id: 1
                    },

                    {
                        css: {
                            left: "0",
                            top: "100px",
                            width: "50%",
                            height: "calc(100% - 100px)"
                        },
                        content_id: 2
                    },

                    {
                        css: {
                            right: "0",
                            top: "100px",
                            width: "50%",
                            height: "calc(100% - 100px)"
                        },
                        content_id: 3
                    }
                ],

                // The action sets that are part of this game state
                // The content components can allow the user to choose one of these
                // action sets, resulting in the actions within
                actionSets: [
                    {
                        // First action set
                        actions: []
                    },
                    {
                        // Second action set
                        actions: []
                    },
                    {
                        // Third action set
                        actions: []
                    }
                ]
            }
        ]
    }
};
////////////////////////////////////////////////////////////////////////////////
