/* Global variables :( */
var currentDungeon = null;
var currentRoom = null;
var currentPlayer = null;

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
    clearOutput();
    output("<b>{0}</b>".format(currentDungeon.name));
    output(currentDungeon.intro_text);
    outputRoom();
}

function loadGameButton(){
    var select = document.getElementById("adventureSelect");
    var dungeonName = select.options[select.selectedIndex].text;
    var save = loadGame(dungeonName);
    if(save !== null){
        startGame(save);
        output("<i>Game loaded for {0}</i>".format(dungeonName));
    } else {
        output("Couldn't load save for dungeon " + dungeonName);
    }
    return false;
}

function saveGameButton(){
    var select = document.getElementById("adventureSelect");
    var dungeonName = select.options[select.selectedIndex].text;
    saveGame(dungeonName, currentDungeon);
    output("<i>Saved game for {0}</i>".format(dungeonName));
    return false;
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
    if(currentRoom.exits && currentRoom.exits[direction] && currentRoom.exits[direction].destination){
        var roomState = getCurrentState(direction,"exit",currentRoom);
        var currentExit = currentRoom.exits[direction].states[roomState];
        if(currentExit.open && currentExit.open === "true"){
            output_break();//for readability sake
            if(currentExit.on_enter){
                output(currentExit.on_enter);//check for and display flavor text
            }
            currentRoom = currentDungeon.rooms[currentRoom.exits[direction].destination];
            outputRoom();
            
        } else {
            console.log("Uh oh");
            if(currentExit.examination)
                output(currentExit.examination + " ");
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
        output("items: {0}".format(outputString));
    } else {
        output("Your inventory is empty!");
    }
}

function look(){
    outputRoom();
}

function use(item_use, item_on){
    if(item_on){
        if(currentDungeon.items[item_on]){//the target is an item
            if(currentPlayer.inventory.indexOf(item_use) != -1 && currentPlayer.inventory.indexOf(item_on) != -1){
                var currentState = getCurrentState(item_on, "item", currentDungeon);
                    if(useable(item_on, currentState, "item", currentDungeon)){
                        var triggers = currentDungeon.items[item_on].states[currentState].on_use.triggers;
                        var notUsed = true;
                        for(var i = 0; i<triggers.length;i++){
                            if(triggers[i].requires && triggers[i].requires[item_use]){
                                output("COMINBATION!");
                            
                                process_trigger(currentDungeon, triggers[i]);
                                notUsed = false;
                            }
                        }
                        if(notUsed){
                            output("You used {0} on {1} to no effect.".format(item_use, item_on));
                        }
                    }
                    else{
                        output("Nothing interesting happened.")
                    }
                    
                
            }
        }
        
        
        
        
        
        
        
    } 
    else {
        if(currentDungeon.items[item_use]){
            if(currentPlayer.inventory.indexOf(item_use) != -1){
                var currentState = getCurrentState(item_use, "item", currentDungeon);
                use_item(item_use, currentState);
            }
            else{
                output("You don't have that!");
            }
        }
        else if(currentRoom.objects[item_use]){
            var currentState = getCurrentState(item_use, "object", currentRoom);
            use_object(item_use, currentState);
               
        }
        else{
            output("You see no such thing.");
        }

                

    }
    return;
}
function use_item(item, currentState){
    if(useable(item, currentState, "item", currentDungeon)){
        var triggers = currentDungeon.items[item].states[currentState].on_use.triggers;
        for(var i = 0; i<triggers.length;i++){
            process_trigger(currentDungeon, triggers[i]);
        }
    }
    else{
        output("Nothing interesting happened.")
    }
    
}
function use_object(item, currentState){
    if(useable(item, currentState, "object", currentRoom)){
        var triggers = currentRoom.objects[item].states[currentState].on_use.triggers;
        for(var i = 0; i<triggers.length;i++){
            process_trigger(currentDungeon, triggers[i]);
        }
    }
    else{
        output("Nothing interesting happened.")
    }
}

function take(item){
    if(currentRoom.items && currentRoom.items.indexOf(item) != -1){
        currentPlayer.inventory.push(item);
        currentRoom.items.splice(currentRoom.items.indexOf(item));
        output("You picked up the {0}!".format(item));
        return;

    }
    else if(currentRoom.objects && currentRoom.objects[item]){
        var currentState = getCurrentState(item,"object",currentRoom);
        var currentObject = currentRoom.objects[item].states[currentState];
        if(currentObject.fail_pickup){
            output(currentObject.fail_pickup);
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
        var currentState = getCurrentState(item,"object",currentRoom);
        var currentObject = currentRoom.objects[item].states[currentState];
        //output("You look at {0}".format(item));
        if(currentObject.examination){
            output(currentObject.examination);
        } else {
            if(currentObject.description){
                output(currentObject.description);
            } else {
                output("There doesn't seem to be anything interesting about that..");
            } 
        }
    }
    else if(currentPlayer.inventory.indexOf(item) != -1 || currentRoom.items && currentRoom.items.indexOf(item) != -1){
        var currentState = getCurrentState(item,"item",currentDungeon);
        var currentItem = currentDungeon.items[item].states[currentState];
        
        //output("You look at {0}".format(item));
        if(currentItem.examination){
            output(currentItem.examination);
        } else {
            if(currentItem.description){
                output(currentItem.description);
            } else {
                output("There doesn't seem to be anything interesting about that..");
            } 
        }
    }
    else if(currentRoom.exits && currentRoom.exits[item]){
        var currentState = getCurrentState(item,"exit",currentRoom);
        var currentExit = currentRoom.exits[item].states[currentState];
        
        if(currentExit.examination){
            output(currentExit.examination);
        }else{
            if(currentExit.description){
                output(currentExit.description);
            }
            else{
                output("It is certainly an exit to this room.");
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


