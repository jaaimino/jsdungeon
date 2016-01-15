/* Will use localstorage to save game */

function localStorageTest(currentDungeon){
    // Store
    localStorage.setItem("lastname", "Smith");
    // Retrieve
    localStorage.getItem("lastname");
}

function saveGame(dungeonName, currentDungeon){
    localStorage.setItem(dungeonName, JSON.stringify(currentDungeon));
}

/*
 * Returns localstorage object save or null
 */
function loadGame(dungeonName){
    try{
        var dungeon = JSON.parse(localStorage.getItem(dungeonName));
        return dungeon;
    }catch(err){
        console.log(err);
        return null;
    }
    return null;
}