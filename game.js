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
        var roomState = currentRoom.exits[direction].current_state;
        if(currentRoom.exits[direction].states[roomState].open && currentRoom.exits[direction].states[roomState].open === "true"){
            currentRoom = currentDungeon.rooms[currentRoom.exits[direction].destination];
            outputRoom();
        } else {
            console.log("Uh oh");
            if(currentRoom.exits[direction].states[roomState].examination)
                output(currentRoom.exits[direction].states[roomState].examination + " ");
        }
    } else {
        output("You can't go {0}!".format(direction));
    }
}

function inventory(){
    if(currentPlayer.inventory.length > 0){
        outputString = "";
        for(var i=0;i<currentPlayer.inventory.length-1;i++){
            outputString += currentPlayer.inventory[i] + ", ";
        }
        outputString+= currentPlayer.inventory[currentPlayer.inventory.length-1];
        output("Inventory: {0}".format(outputString));
    } else {
        output("Your inventory is empty!");
    }
}

function look(){
    outputRoom();
}

function take(item){
    if(currentRoom.items && currentRoom.items.indexOf(item) != -1){
        currentPlayer.inventory.push(item);
        currentRoom.items.splice(currentRoom.items.indexOf(item));
        output("You picked up the {0}!".format(item));
        return;

    }
    else if(currentRoom.objects && currentRoom.objects[item]){
        var currentState = currentRoom.objects[item].current_state;
        if(currentRoom.objects[item].states[currentState].fail_pickup){
            output(currentRoom.objects[item].states[currentState].fail_pickup);
            return;
        }
        else{
            output("You can't carry the {0}!".format(item));
        }
    }
    else{
        output("You fumbled around but only found air.");
    }
}

function examine(item){
    if(currentRoom.objects && currentRoom.objects[item]){
        var currentState = currentRoom.objects[item].current_state;
        //output("You look at {0}".format(item));
        if(currentRoom.objects[item].states[currentState].examination){
            output(currentRoom.objects[item].states[currentState].examination);
        } else {
            if(currentRoom.objects[item].states[currentState].description){
                output(currentRoom.objects[item].states[currentState].description);
            } else {
                output("There doesn't seem to be anything interesting about that..");
            } 
        }
    }
    else if(currentPlayer.inventory.indexOf(item) != -1 || currentRoom.items && currentRoom.items.indexOf(item) != -1){
        var currentState = currentDungeon.items[item].current_state;
        //output("You look at {0}".format(item));
        if(currentDungeon.items[item].states[currentState].examination){
            output(currentDungeon.items[item].states[currentState].examination);
        } else {
            if(currentDungeon.items[item].states[currentState].description){
                output(currentDungeon.items[item].states[currentState].description);
            } else {
                output("There doesn't seem to be anything interesting about that..");
            } 
        }
    }
    else{
        output("There's nothing in this room like that!");
    }
}


function help(){
    output("Your available actions are as follows:");
    output("look - describes the room");
    output("move <direction> - attempts to leave the room in that direction");
    output("examine <object> - examines an object");
    output("take <object> - attempts to take an object");
    output("talk <thing> - talks to the thing");
    output("inventory - checks your current items");
    output("help - displays this message!");
}


