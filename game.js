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
    outputRoom();
}

function gameloop(text){
    parseInput(text);
}

function outputRoom(){
    var outputString = "";
    outputString += currentRoom.description + " ";
    for (var key in currentRoom.objects){
        if(currentRoom.objects.hasOwnProperty(key)){
            var objectState = currentRoom.objects[key].current_state;
            outputString += currentRoom.objects[key].states[objectState].description + " ";
        }
    }
    if(currentRoom.items){
        for (var i=0;i<currentRoom.items.length;i++){
            var item = currentRoom.items[i];
            var itemState = currentDungeon.items[item].current_state;
            if(currentDungeon.items[item].states[itemState].visible){
                outputString += currentDungeon.items[item].states[itemState].description + " ";
            }
        }
    }
    for (var key in currentRoom.exits){
        if(currentRoom.exits.hasOwnProperty(key)){
            var roomState = currentRoom.exits[key].current_state;
            outputString += currentRoom.exits[key].states[roomState].description + " ";
        }
    }
    output(outputString);
}

/* Interaction Stuff */
function move(direction){
    if(currentRoom.exits[direction] && currentRoom.exits[direction].destination){
        currentRoom = currentDungeon.rooms[currentRoom.exits[direction].destination];
        outputRoom();
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
    if(currentRoom.objects[item]){
        var currentState = currentRoom.objects[item].current_state;
        output("You look at {0}".format(item));
        output(currentRoom.objects[item].states[currentState].description);
    }
    else if(currentPlayer.inventory.indexOf(item) != -1 || currentRoom.items.indexOf(item) != -1){
        var currentState = currentDungeon.items[item].current_state;
        output("You look at {0}".format(item));
        output(currentDungeon.items[item].states[currentState].description);
    }
    else{
        output("There's nothing in this room like that!");
    }
}


