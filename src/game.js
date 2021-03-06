/* Global variables :( */
jsdungeon.game_over = false;
jsdungeon.currentDungeon = null;

jsdungeon.startGame = function(dungeon) {
    //Do some setup
    jsdungeon.game_over = false;
    jsdungeon.currentDungeon = dungeon;
    //If we don't have a current room, we're starting a new save
    if(!jsdungeon.getCurrentDungeon().currentRoom){
        jsdungeon.getCurrentDungeon().currentRoom = jsdungeon.getCurrentDungeon().rooms[jsdungeon.getCurrentDungeon().start_room];
        if (jsdungeon.getCurrentDungeon().player) {
            jsdungeon.getCurrentDungeon().currentPlayer = jsdungeon.getCurrentDungeon().player;
            if (!jsdungeon.getCurrentDungeon().currentPlayer.inventory) {
                jsdungeon.getCurrentDungeon().currentPlayer.inventory = [];
            }
            if (!jsdungeon.getCurrentDungeon().currentPlayer.description) {
                jsdungeon.getCurrentDungeon().currentPlayer.description = "A person.";
            }
        }
        else {
            jsdungeon.getCurrentDungeon().currentPlayer = {
                name: "Jim",
                description: "A person",
                inventory: []
            }
        }
        jsdungeon.clearOutput();
        jsdungeon.examine_self();
        jsdungeon.outputRoom();
    //Else, we're restoring the game state
    } else {
        jsdungeon.clearOutput();
        jsdungeon.outputRoom();
    }
    return jsdungeon.outputString;
}

jsdungeon.gameloop = function(text) {
    jsdungeon.parseInput(text);
}

jsdungeon.look = function() {
    jsdungeon.outputRoom();
}

jsdungeon.outputRoom = function() {
    var string = "";
    if(jsdungeon.getCurrentRoom().name){
        jsdungeon.output("<span class='room-name'>{0}</span>".format(jsdungeon.getCurrentRoom().name));
    }

    //Print room description
    jsdungeon.output(jsdungeon.getCurrentRoom().description + " ");

    //Print out all objects current description for their respective states
    for (var key in jsdungeon.getCurrentRoom().objects) {
        if (jsdungeon.getCurrentRoom().objects.hasOwnProperty(key)) {
            var objectState = jsdungeon.getCurrentRoom().objects[key].current_state;
            if(jsdungeon.getCurrentRoom().objects[key].states[objectState].description){//checking for description allows for easy linking/hiding of things without descriptions.
                string += jsdungeon.getCurrentRoom().objects[key].states[objectState].description + " ";
            }
        }
    }

    //Print out all items current description for their respective states
    if (jsdungeon.getCurrentRoom().items) {
        for (var i = 0; i < jsdungeon.getCurrentRoom().items.length; i++) {
            var item = jsdungeon.getCurrentRoom().items[i];
            var itemState = jsdungeon.getCurrentDungeon().items[item].current_state;
            if(jsdungeon.getCurrentDungeon().items[item].states[itemState].description){
                string += jsdungeon.getCurrentDungeon().items[item].states[itemState].description + " ";
            }
        }
    }

    //Print out all exits current description for their respective states
    for (var key in jsdungeon.getCurrentRoom().exits) {
        if (jsdungeon.getCurrentRoom().exits.hasOwnProperty(key)) {
            var roomState = jsdungeon.getCurrentRoom().exits[key].current_state;
            if(jsdungeon.getCurrentRoom().exits[key].states[roomState].description){//made this one optional so we can have hidden doors until a trigger happens.
                string += jsdungeon.getCurrentRoom().exits[key].states[roomState].description + " ";
            }
        }
    }
    jsdungeon.output(string)
}

/* Interaction Stuff */
jsdungeon.move = function(direction) {
    if (jsdungeon.getCurrentRoom().exits && jsdungeon.check_exist(jsdungeon.getCurrentRoom().exits[direction], "destination")) {
        var roomState = jsdungeon.getCurrentState(direction, "exits", jsdungeon.getCurrentRoom());
        var currentExit = jsdungeon.getCurrentRoom().exits[direction].states[roomState];
        if(currentExit.open){
            if(currentExit.open === "true"){
                jsdungeon.leave_room(currentExit,direction);
            }
            else {
                console.log("Uh oh");
                if(currentExit.examination){
                    jsdungeon.output(currentExit.examination + " ");
                }
            }
        }
        else{//assume door is always open
            jsdungeon.leave_room(currentExit,direction);
        }
    }
    else {
        jsdungeon.output("You can't go {0}!".format(direction));
    }
}

jsdungeon.leave_room = function(currentExit,direction){
    jsdungeon.output_break();//for readability sake 
    if(currentExit.on_enter){
        if(currentExit.on_enter.description)
            jsdungeon.output(currentExit.on_enter.description); //check for and display flavor text
        if(currentExit.on_enter.triggers){
            jsdungeon.looptriggers(currentExit.on_enter.triggers);
            
        }
    }
    jsdungeon.getCurrentDungeon().currentRoom = jsdungeon.getCurrentDungeon().rooms[jsdungeon.getCurrentRoom().exits[direction].destination];
    jsdungeon.outputRoom();
}

jsdungeon.inventory = function() {
    if (jsdungeon.currentDungeon.currentPlayer.inventory.length > 0) {
        var inventoryString = "";
        for (var i = 0; i < jsdungeon.currentDungeon.currentPlayer.inventory.length - 1; i++) {
            inventoryString += "<i>" + jsdungeon.currentDungeon.currentPlayer.inventory[i] + "</i>" + ", ";
        }
        inventoryString += "<i>" + jsdungeon.currentDungeon.currentPlayer.inventory[jsdungeon.currentDungeon.currentPlayer.inventory.length - 1] + "</i>";
        jsdungeon.output("inventory: {0}".format(inventoryString));
    }
    else {
        jsdungeon.output("Your inventory is empty!");
    }
}

jsdungeon.use = function(item_use, item_on) {
    if (item_on) {
        jsdungeon.use_x_on_y(item_use,item_on);
    }
    //Else USE X
    else {
        if (jsdungeon.check_exist(jsdungeon.getCurrentDungeon().items, item_use)) {
            if (jsdungeon.currentDungeon.currentPlayer.inventory.indexOf(item_use) != -1) {
                var currentState = jsdungeon.getCurrentState(item_use, "items", jsdungeon.getCurrentDungeon());
                jsdungeon.use_X(item_use, currentState, "items", jsdungeon.getCurrentDungeon());
            }
            else {
                jsdungeon.output("You don't have {0}!".format(item_use));
            }
        }
        else if (jsdungeon.check_exist(jsdungeon.getCurrentRoom().objects, item_use)) {
            var currentState = jsdungeon.getCurrentState(item_use, "objects", jsdungeon.getCurrentRoom());
            jsdungeon.use_X(item_use, currentState, "objects", jsdungeon.getCurrentRoom());
        }
        else {
            jsdungeon.output("You don't have {0}!".format(item_use));
        }
    }
    return;
}

jsdungeon.use_x_on_y = function(item_use,item_on){
        if (jsdungeon.check_exist(jsdungeon.getCurrentDungeon().items, item_on)) { //the target is an item
            if (jsdungeon.currentDungeon.currentPlayer.inventory.indexOf(item_on) != -1) {
                jsdungeon.use_type("items",item_use,item_on, jsdungeon.getCurrentDungeon());
            }
            else{
                jsdungeon.output("You don't have {0} in your inventory.".format(item_on));
            }
        }
        else if (jsdungeon.check_exist(jsdungeon.getCurrentRoom().exits, item_on)) { //the target is an exit
            jsdungeon.use_type("exits", item_use,item_on, jsdungeon.getCurrentRoom());
        }
        else if (jsdungeon.check_exist(jsdungeon.getCurrentRoom().objects,item_on)) { //the target is an object
            jsdungeon.use_type("objects",item_use,item_on, jsdungeon.getCurrentRoom());;
        }
        else {
            jsdungeon.output("You do nothing with {0} or {1} as {1} doesn't exist.".format(item_use, item_on));
        }
}

//helpers for use
jsdungeon.use_type = function(type, item_use,item_on, currentArea){
    if (jsdungeon.currentDungeon.currentPlayer.inventory.indexOf(item_use) != -1) {
        var currentState = jsdungeon.getCurrentState(item_on, type, currentArea);
        if (jsdungeon.useable(item_on, currentState, type, currentArea)) {
            var triggers = currentArea[type][item_on].states[currentState].on_use.triggers;
            var use_currentState = jsdungeon.getCurrentState(item_use, "items", jsdungeon.getCurrentDungeon());
            jsdungeon.trigger_action(item_use, item_on, triggers, use_currentState);
        }
        else {
            jsdungeon.output("You can't do anything to {0} with {1}.".format(item_on, item_use));
        }
    }
    else {
        jsdungeon.output("You don't have {0} in your inventory.".format(item_use));
    }
}

jsdungeon.use_X = function(item, currentState, type, currentArea) {
    if (jsdungeon.useable(item, currentState, type, currentArea)) {
        var triggers = currentArea[type][item].states[currentState].on_use.triggers;
        for (var i = 0; i < triggers.length; i++) {
            if (!triggers[i].requires) {
                jsdungeon.process_trigger(triggers[i]);
                if (triggers[i].single_trigger && triggers[i].single_trigger === "true") {
                    triggers.splice(i, 1);
                    i = i-1;
                }
            }
        }
    }
    else {
        jsdungeon.output("Nothing interesting happened.")
    }

}

jsdungeon.take = function(item) {
    if (jsdungeon.getCurrentRoom().items && jsdungeon.getCurrentRoom().items.indexOf(item) != -1) {
        
        jsdungeon.currentDungeon.currentPlayer.inventory.push(item);
        jsdungeon.getCurrentRoom().items.splice(jsdungeon.getCurrentRoom().items.indexOf(item),1);
        jsdungeon.output("You picked up <i>{0}</i>.".format(item));
        return;

    }
    else if (jsdungeon.check_exist(jsdungeon.getCurrentRoom().objects,item)) {
        var currentState = jsdungeon.getCurrentState(item, "objects", jsdungeon.getCurrentRoom());
        var currentObject = jsdungeon.getCurrentRoom().objects[item].states[currentState];
        if (currentObject.fail_pickup) {
            jsdungeon.output(currentObject.fail_pickup);
            return;
        }
        else {
            jsdungeon.output("You can't carry the {0}!".format(item));
        }
    }
    else {
        jsdungeon.output("You fumbled around but only found air.");
    }
}

jsdungeon.examine_self = function(){
    jsdungeon.output("Your name is " + jsdungeon.currentDungeon.currentPlayer.name + ". " + jsdungeon.currentDungeon.currentPlayer.description);
    jsdungeon.output(jsdungeon.getCurrentDungeon().intro_text);
}

jsdungeon.examine = function(item) {

    if (item === "self") {
        jsdungeon.examine_self();
    }
    else if (jsdungeon.check_exist(jsdungeon.getCurrentRoom().objects,item)) {
        var currentState = jsdungeon.getCurrentState(item, "objects", jsdungeon.getCurrentRoom());
        var currentObject = jsdungeon.getCurrentRoom().objects[item].states[currentState];
        //jsdungeon.output("You look at {0}".format(item));
        jsdungeon.lookatthing(item, currentObject);
    }
    else if (jsdungeon.currentDungeon.currentPlayer.inventory.indexOf(item) != -1 || jsdungeon.getCurrentRoom().items && jsdungeon.getCurrentRoom().items.indexOf(item) != -1) {
        var currentState = jsdungeon.getCurrentState(item, "items", jsdungeon.getCurrentDungeon());
        var currentItem = jsdungeon.getCurrentDungeon().items[item].states[currentState];

        //jsdungeon.output("You look at {0}".format(item));
        jsdungeon.lookatthing(item, currentItem);
    }
    else if (jsdungeon.check_exist(jsdungeon.getCurrentRoom().exits,item)) {
        var currentState = jsdungeon.getCurrentState(item, "exits", jsdungeon.getCurrentRoom());
        var currentExit = jsdungeon.getCurrentRoom().exits[item].states[currentState];

        
        jsdungeon.lookatthing(item, currentExit);
        

    }
    else {
        jsdungeon.output("There's nothing in this room like that!");
    }
}

jsdungeon.lookatthing = function(item, currentThing){
    
    if(currentThing.on_examine){
        var noprint = true;
        if(currentThing.on_examine.description){
            jsdungeon.output(currentThing.on_examine.description);
            noprint = false;
        }
        if(currentThing.on_examine.triggers){
            jsdungeon.looptriggers(currentThing.on_examine.triggers);
            noprint = false;
        }
        if(noprint){
            jsdungeon.output("There doesn't seem to be anything interesting about {0}...".format(item));
        }
        
    }
    //leaving this in for legacy purposes todo:revamp all adventures to use new version DON'T MENTION THIS STYLE IN THE DOCUMENTATION
    else if (currentThing.examination) {
        jsdungeon.output(currentThing.examination);

    }
    else {
        jsdungeon.output("There doesn't seem to be anything interesting about {0}...".format(item));
    }
    
}

jsdungeon.talk = function(person){
    if(jsdungeon.check_exist(jsdungeon.getCurrentRoom().objects,person)){
        
        var currentState = jsdungeon.getCurrentState(person,"objects",jsdungeon.getCurrentRoom());
        var currentPerson = jsdungeon.getCurrentRoom().objects[person].states[currentState];
        var notalk=true;
        
        if(jsdungeon.check_exist(currentPerson.on_talk,"description")){
            jsdungeon.output(currentPerson.on_talk.description);
            notalk=false;
        }
        if(jsdungeon.check_exist(currentPerson.on_talk,"triggers")){
            notalk=false;
            jsdungeon.looptriggers(currentPerson.on_talk.triggers);
            
        }
        if(notalk){
            jsdungeon.output("There was nothing much to say.");
        }
    }
    else{
        jsdungeon.output("You couldn't figure out how to talk to that.")
    }
}

jsdungeon.help = function() {
    jsdungeon.output(
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


jsdungeon.error = function(item){
    jsdungeon.output("{0} doesn't exist here!".format(item));
}

/* Various getters below */
jsdungeon.getObjects = function(room){
    if(room){
        return jsdungeon.getCurrentDungeon().rooms[room].objects;
    } else {
        return jsdungeon.getCurrentRoom().objects;
    }
}

jsdungeon.getItems = function(){
    return jsdungeon.getCurrentDungeon().items;
}

jsdungeon.getRoomItems = function(room){
    if(room){
        return jsdungeon.getCurrentDungeon().rooms[room].items;
    } else {
        return jsdungeon.getCurrentRoom().items;
    }
}

jsdungeon.getExits = function(room){
    if(room){
        return jsdungeon.getCurrentDungeon().rooms[room].exits;
    } else {
        return jsdungeon.getCurrentRoom().exits;
    }
}

jsdungeon.getCurrentPlayer = function() {
    return jsdungeon.getCurrentDungeon().currentPlayer;
}

jsdungeon.getCurrentDungeon = function(){
    return jsdungeon.currentDungeon;
}
jsdungeon.getCurrentRoom = function(){
    return jsdungeon.getCurrentDungeon().currentRoom;
}

jsdungeon.isGameOver = function() {
    return jsdungeon.game_over;
}

jsdungeon.endGame = function() {
    jsdungeon.game_over = true;
}