/* Global variables :( */
var currentDungeon = null;
var currentRoom = null;
var currentPlayer = null;

loadJSON("dungeons.json", function(response){
   var response_json = JSON.parse(response);
   loadJSON(response_json.dungeons[0].filename, function(response){
       var new_response_json = JSON.parse(response);
       startGame(new_response_json);
    });
});

function startGame(dungeon){
    //Do some setup
    currentDungeon = dungeon;
    currentRoom = currentDungeon.rooms[currentDungeon.start_room];
    if(currentDungeon.player){
        currentPlayer = currentDungeon.player;
        if(!currentPlayer.inventory){
            currentPlayer.inventory = [];
        }
    } else {
        currentPlayer = {
            name : "Jim",
            inventory : []
        }
    }
    output("<b>{0}</b>".format(currentDungeon.name));
    output(currentDungeon.intro_text);
    output(currentRoom.description);
}

function gameloop(text){
    parseInput(text);
}

/* Interaction Stuff */
function move(direction){
    if(currentRoom[direction] && currentRoom[direction].destination){
        currentRoom = currentDungeon.rooms[currentRoom[direction].destination];
        output(currentRoom.description);
    } else {
        output("You can't go {0}!".format(direction));
    }
}

function inventory(){
    if(currentPlayer.inventory.length > 0){
        output("Inventory: {0}".format(currentPlayer.inventory.toString()));
    } else {
        output("Your inventory is empty!");
    }
}

function look(){
    if(currentRoom.description){
        output(currentRoom.description);
    }
}

function examine(item){
    
}

