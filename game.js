/* Global variables :( */
var game_over = false;
var currentDungeon = null;

function startGame(dungeon) {
    //Do some setup
    game_over = false;
    currentDungeon = dungeon;
    if(currentDungeon.background){
        setBackgroungImage(currentDungeon.background);
    } else {
        setBackgroungImage("img/dungeon.jpg");
    }
    document.getElementById("page-title").innerHTML = getCurrentDungeon().name;
    var page_title_inner = "<b>{0}</b>".format(getCurrentDungeon().name);
    document.getElementById("page-title-inner").innerHTML = page_title_inner;
    //If we don't have a current room, we're starting a new save
    if(!getCurrentDungeon().currentRoom){
        getCurrentDungeon().currentRoom = getCurrentDungeon().rooms[getCurrentDungeon().start_room];
        if (getCurrentDungeon().player) {
            getCurrentDungeon().currentPlayer = getCurrentDungeon().player;
            if (!getCurrentDungeon().currentPlayer.inventory) {
                getCurrentDungeon().currentPlayer.inventory = [];
            }
            if (!getCurrentDungeon().currentPlayer.description) {
                getCurrentDungeon().currentPlayer.description = "A person.";
            }
        }
        else {
            getCurrentDungeon().currentPlayer = {
                name: "Jim",
                description: "A person",
                inventory: []
            }
        }
        clearOutput();
        examine_self();
        outputRoom();
    //Else, we're restoring the game state
    } else {
        clearOutput();
        outputRoom();
    }
}

function loadGameButton() {
    var select = document.getElementById("adventureSelect");
    var dungeonName = select.options[select.selectedIndex].text;
    var save = loadGame(dungeonName);
    if (save !== null) {
        startGame(save);
        output("<i>Game loaded for {0}</i>".format(dungeonName));
    }
    else {
        output("Couldn't load save for dungeon " + dungeonName);
    }
    return false;
}

function saveGameButton() {
    var select = document.getElementById("adventureSelect");
    var dungeonName = select.options[select.selectedIndex].text;
    saveGame(dungeonName, getCurrentDungeon());
    output("<i>Saved game for {0}</i>".format(dungeonName));
    return false;
}

function gameloop(text) {
    parseInput(text);
}

function look() {
    outputRoom();
}

function outputRoom() {
    if(getCurrentRoom().name){
        output("<span class='room-name'>{0}</span>".format(getCurrentRoom().name));
    }
    var outputString = "";
    outputString += getCurrentRoom().description + " ";
    for (var key in getCurrentRoom().objects) {
        if (getCurrentRoom().objects.hasOwnProperty(key)) {
            var objectState = getCurrentRoom().objects[key].current_state;
            outputString += getCurrentRoom().objects[key].states[objectState].description + " ";
        }
    }
    if (getCurrentRoom().items) {
        for (var i = 0; i < getCurrentRoom().items.length; i++) {
            var item = getCurrentRoom().items[i];
            var itemState = getCurrentDungeon().items[item].current_state;
            outputString += getCurrentDungeon().items[item].states[itemState].description + " ";
        }
    }
    for (var key in getCurrentRoom().exits) {
        if (getCurrentRoom().exits.hasOwnProperty(key)) {
            var roomState = getCurrentRoom().exits[key].current_state;
            outputString += getCurrentRoom().exits[key].states[roomState].description + " ";
        }
    }
    output(outputString);
}

/* Interaction Stuff */
function move(direction) {
    if (getCurrentRoom().exits && check_exist(getCurrentRoom().exits[direction], "destination")) {
        var roomState = getCurrentState(direction, "exits", getCurrentRoom());
        var currentExit = getCurrentRoom().exits[direction].states[roomState];
        if(currentExit.open){
            if(currentExit.open === "true"){
                leave_room(currentExit,direction);
            }
            else {
                console.log("Uh oh");
                if(currentExit.examination){
                    output(currentExit.examination + " ");
                }
            }
        }
        else{//assume door is always open
            leave_room(currentExit,direction);
        }
    }
    else {
        output("You can't go {0}!".format(direction));
    }
}

function leave_room(currentExit,direction){
    output_break();//for readability sake 
    if(currentExit.on_enter){
        if(currentExit.on_enter.description)
            output(currentExit.on_enter.description); //check for and display flavor text
        if(currentExit.on_enter.triggers){
            var triggers = currentExit.on_enter.triggers;
            for(var i=0;i<triggers.length;i++){
                var shouldReturn = false;
                process_trigger(triggers[i]);
                if(triggers[i].trigger_blocking && triggers[i].trigger_blocking === "true")
                    shouldReturn = true;
                if(triggers[i].single_trigger && triggers[i].single_trigger === "true"){
                    triggers.splice(i, 1);
                    i-=1;
                }
                if(shouldReturn)
                    return;
            }
        }
    }
    getCurrentDungeon().currentRoom = getCurrentDungeon().rooms[getCurrentRoom().exits[direction].destination];
    outputRoom();
}

function inventory() {
    if (currentDungeon.currentPlayer.inventory.length > 0) {
        outputString = "";
        for (var i = 0; i < currentDungeon.currentPlayer.inventory.length - 1; i++) {
            outputString += "<i>" + currentDungeon.currentPlayer.inventory[i] + "</i>" + ", ";
        }
        outputString += "<i>" + currentDungeon.currentPlayer.inventory[currentDungeon.currentPlayer.inventory.length - 1] + "</i>";
        output("inventory: {0}".format(outputString));
    }
    else {
        output("Your inventory is empty!");
    }
}

function use(item_use, item_on) {
    if (item_on) {
        use_x_on_y(item_use,item_on);
    }
    //Else USE X
    else {
        if (check_exist(getCurrentDungeon().items, item_use)) {
            if (currentDungeon.currentPlayer.inventory.indexOf(item_use) != -1) {
                var currentState = getCurrentState(item_use, "items", getCurrentDungeon());
                use_X(item_use, currentState, "items", getCurrentDungeon());
            }
            else {
                output("You don't have {0}!".format(item_use));
            }
        }
        else if (check_exist(getCurrentRoom().objects, item_use)) {
            var currentState = getCurrentState(item_use, "objects", getCurrentRoom());
            use_X(item_use, currentState, "objects", getCurrentRoom());
        }
        else {
            output("You don't have {0}!".format(item_use));
        }
    }
    return;
}

function use_x_on_y(item_use,item_on){
        if (check_exist(getCurrentDungeon().items, item_on)) { //the target is an item
            if (currentDungeon.currentPlayer.inventory.indexOf(item_on) != -1) {
                use_type("items",item_use,item_on, getCurrentDungeon());
            }
            else{
                output("You don't have {0} in your inventory.".format(item_on));
            }
        }
        else if (check_exist(getCurrentRoom().exits, item_on)) { //the target is an exit
            use_type("exits", item_use,item_on, getCurrentRoom());
        }
        else if (check_exist(getCurrentRoom().objects,item_on)) { //the target is an object
            use_type("objects",item_use,item_on, getCurrentRoom());;
        }
        else {
            output("You do nothing with {0} or {1} as {1} doesn't exist.".format(item_use, item_on));
        }
}

//helpers for use
function use_type(type, item_use,item_on, currentArea){
    if (currentDungeon.currentPlayer.inventory.indexOf(item_use) != -1) {
        var currentState = getCurrentState(item_on, type, currentArea);
        if (useable(item_on, currentState, type, currentArea)) {
            var triggers = currentArea[type][item_on].states[currentState].on_use.triggers;
            var use_currentState = getCurrentState(item_use, "items", getCurrentDungeon());
            trigger_action(item_use, item_on, triggers, use_currentState);
        }
        else {
            output("You see nothing in the direction of {0} that you can do anything with {1}.".format(item_on, item_use));
        }
    }
    else {
        output("You don't have {0} in your inventory.".format(item_use));
    }
}

function use_X(item, currentState, type, currentArea) {
    if (useable(item, currentState, type, currentArea)) {
        var triggers = currentArea[type][item].states[currentState].on_use.triggers;
        for (var i = 0; i < triggers.length; i++) {
            if (!triggers[i].requires) {
                process_trigger(triggers[i]);
                if (triggers[i].single_trigger && triggers[i].single_trigger === "true") {
                    triggers.splice(i, 1);
                    i = i-1;
                }
            }
        }
    }
    else {
        output("Nothing interesting happened.")
    }

}

function take(item) {
    if (getCurrentRoom().items && getCurrentRoom().items.indexOf(item) != -1) {
        
        currentDungeon.currentPlayer.inventory.push(item);
        getCurrentRoom().items.splice(getCurrentRoom().items.indexOf(item),1);
        output("You picked up <i>{0}</i>.".format(item));
        return;

    }
    else if (check_exist(getCurrentRoom().objects,item)) {
        var currentState = getCurrentState(item, "objects", getCurrentRoom());
        var currentObject = getCurrentRoom().objects[item].states[currentState];
        if (currentObject.fail_pickup) {
            output(currentObject.fail_pickup);
            return;
        }
        else {
            output("You can't carry the {0}!".format(item));
        }
    }
    else {
        output("You fumbled around but only found air.");
    }
}

function examine_self(){
    output("Your name is " + currentDungeon.currentPlayer.name + ". " + currentDungeon.currentPlayer.description);
    output(getCurrentDungeon().intro_text);
}

function examine(item) {

    if (item === "self") {
        examine_self();
    }
    else if (check_exist(getCurrentRoom().objects,item)) {
        var currentState = getCurrentState(item, "objects", getCurrentRoom());
        var currentObject = getCurrentRoom().objects[item].states[currentState];
        //output("You look at {0}".format(item));
        lookatthing(currentObject);
    }
    else if (currentDungeon.currentPlayer.inventory.indexOf(item) != -1 || getCurrentRoom().items && getCurrentRoom().items.indexOf(item) != -1) {
        var currentState = getCurrentState(item, "items", getCurrentDungeon());
        var currentItem = getCurrentDungeon().items[item].states[currentState];

        //output("You look at {0}".format(item));
        lookatthing(currentItem);
    }
    else if (check_exist(getCurrentRoom().exits,item)) {
        var currentState = getCurrentState(item, "exits", getCurrentRoom());
        var currentExit = getCurrentRoom().exits[item].states[currentState];

        if (currentExit.examination) {
            output(currentExit.examination);
        }
        else {
            output("It is certainly an exit to this room.");
        }
    }
    else {
        output("There's nothing in this room like that!");
    }
}

function lookatthing(currentThing){
    if (currentThing.examination) {
        output(currentThing.examination);
    }
    else {
        output("There doesn't seem to be anything interesting about that...");
    }
}

function talk(person){
    if(check_exist(getCurrentRoom().objects,person)){
        
        var currentState = getCurrentState(person,"objects",getCurrentRoom());
        var currentPerson = getCurrentRoom().objects[person].states[currentState];
        var notalk=true;
        
        if(check_exist(currentPerson.on_talk,"description")){
            output(currentPerson.on_talk.description);
            notalk=false;
        }
        if(check_exist(currentPerson.on_talk,"triggers")){
            notalk=false;
            var triggers = currentPerson.on_talk.triggers;
            for(var i = 0; i<triggers.length;i++){
                process_trigger(triggers[i]);
                if(triggers[i].single_trigger && triggers[i].single_trigger === "true"){
                    triggers.splice(i, 1);
                    i-=1;
                }
            }
        }
        if(notalk){
            output("There was nothing much to say.");
        }
    }
    else{
        output("You couldn't figure out how to talk to that.")
    }
}

function help() {
    output(
        "Your available actions are as follows: <br>" +
        "<i>look</i> - describes the room <br>" +
        "<i>go</i> (direction) - attempts to leave the room in that direction <br>" +
        "<i>examine</i> (item, object, direction) - examines an object <br>" +
        "<i>search</i> (item, object, direction) - searches an object <br>" + 
        "<i>open</i> (item, object, direction) - opens an object <br>" + 
        "<i>take</i> (item) - attempts to take an object <br>" +
        "<i>use</i> (object, direction, item) - use something <br>" +
        "<i>use</i> (item) <i>on</i> (object, direction, item) - use something on something <br>" +
        "<i>give</i> (item) <i>to</i> (object, direction, item) - give something to something <br>" +
        "<i>talk (to)</i> (object, direciton, item) - talks to something <br>" +
        "<i>inventory</i> - checks your current items <br>" +
        "<i>help</i> - displays this message! <br>"
        );
}

/* Various getters below */
function getObjects(room){
    if(room){
        return getCurrentDungeon().rooms[room].objects;
    } else {
        return getCurrentRoom().objects;
    }
}

function getItems(){
    return getCurrentDungeon().items;
}

function getRoomItems(room){
    if(room){
        return getCurrentDungeon().rooms[room].items;
    } else {
        return getCurrentRoom().items;
    }
}

function getExits(room){
    if(room){
        return getCurrentDungeon().rooms[room].exits;
    } else {
        return getCurrentRoom().exits;
    }
}

function getCurrentPlayer() {
    return getCurrentDungeon().currentPlayer;
}

function getCurrentDungeon(){
    return currentDungeon;
}
function getCurrentRoom(){
    return getCurrentDungeon().currentRoom;
}

function isGameOver() {
    return game_over;
}

function endGame() {
    game_over = true;
}