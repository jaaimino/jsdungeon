jsdungeon.saveGame = function(dungeonName, currentDungeon){
    currentDungeon.currentPlayer = jsdungeon.getCurrentPlayer();
    jsdungeon.localStorage.setItem(dungeonName, JSON.stringify(currentDungeon));
}

/*
 * Returns localstorage object save or null
 */
jsdungeon.loadGame = function(dungeonName){
    try{
        var dungeon = JSON.parse(jsdungeon.localStorage.getItem(dungeonName));
        return dungeon;
    }catch(err){
        console.log(err);
        return null;
    }
    return null;
} 