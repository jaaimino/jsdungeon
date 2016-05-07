/**
 * jsdungeon - JSdungeon is a text-based adventure game engine. You can create your own dungeons by configuring them in JSON. Examples are in the repository, and you're free to take a modify them for your own use.
 * @version v1.1.0
 * @link https://github.com/jaaimino/jsdungeon#readme
 * @license ISC
 */
jsdungeon = {};

/* Global variables :( */
var game_over = false;
var currentDungeon = null;
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

jsdungeon.loadGameButton = function() {
    var select = document.getElementById("adventureSelect");
    var dungeonName = select.options[select.selectedIndex].text;
    var save = jsdungeon.loadGame(dungeonName);
    if (save !== null) {
        jsdungeon.startGame(save);
        jsdungeon.output("<i>Game loaded for {0}</i>".format(dungeonName));
    }
    else {
        jsdungeon.output("Couldn't load save for dungeon " + dungeonName);
    }
    return false;
}

jsdungeon.saveGameButton = function() {
    var select = document.getElementById("adventureSelect");
    var dungeonName = select.options[select.selectedIndex].text;
    jsdungeon.saveGame(dungeonName, jsdungeon.getCurrentDungeon());
    jsdungeon.output("<i>Saved game for {0}</i>".format(dungeonName));
    return false;
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
    jsdungeon.output(jsdungeon.getCurrentRoom().description + " ");
    for (var key in jsdungeon.getCurrentRoom().objects) {
        if (jsdungeon.getCurrentRoom().objects.hasOwnProperty(key)) {
            var objectState = jsdungeon.getCurrentRoom().objects[key].current_state;
            if(jsdungeon.getCurrentRoom().objects[key].states[objectState].description){//checking for description allows for easy linking/hiding of things without descriptions.
                string += jsdungeon.getCurrentRoom().objects[key].states[objectState].description + " ";
            }
        }
    }
    if (jsdungeon.getCurrentRoom().items) {
        for (var i = 0; i < jsdungeon.getCurrentRoom().items.length; i++) {
            var item = jsdungeon.getCurrentRoom().items[i];
            var itemState = jsdungeon.getCurrentDungeon().items[item].current_state;
            if(jsdungeon.getCurrentDungeon().items[item].states[itemState].description){
                string += jsdungeon.getCurrentDungeon().items[item].states[itemState].description + " ";
            }
        }
    }
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
        jsdungeon.lookatthing(currentObject);
    }
    else if (jsdungeon.currentDungeon.currentPlayer.inventory.indexOf(item) != -1 || jsdungeon.getCurrentRoom().items && jsdungeon.getCurrentRoom().items.indexOf(item) != -1) {
        var currentState = jsdungeon.getCurrentState(item, "items", jsdungeon.getCurrentDungeon());
        var currentItem = jsdungeon.getCurrentDungeon().items[item].states[currentState];

        //jsdungeon.output("You look at {0}".format(item));
        jsdungeon.lookatthing(currentItem);
    }
    else if (jsdungeon.check_exist(jsdungeon.getCurrentRoom().exits,item)) {
        var currentState = jsdungeon.getCurrentState(item, "exits", jsdungeon.getCurrentRoom());
        var currentExit = jsdungeon.getCurrentRoom().exits[item].states[currentState];

        
        jsdungeon.lookatthing(currentExit);
        

    }
    else {
        jsdungeon.output("There's nothing in this room like that!");
    }
}

jsdungeon.lookatthing = function(currentThing){
    
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
            jsdungeon.output("There doesn't seem to be anything interesting about {0}...".format(currentThing));
        }
        
    }
    //leaving this in for legacy purposes todo:revamp all adventures to use new version DON'T MENTION THIS STYLE IN THE DOCUMENTATION
    else if (currentThing.examination) {
        jsdungeon.output(currentThing.examination);

    }
    else {
        jsdungeon.output("There doesn't seem to be anything interesting about {0}...".format(currentThing));
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


jsdungeon.getCurrentState = function(itemname, itemtype,currentArea){
    
    if(itemtype ==="items"){
        return currentArea.items[itemname].current_state;
    }
    
    else if(itemtype ==="objects"){
        return currentArea.objects[itemname].current_state;
    }
    else if(itemtype === "exits"){
        return currentArea.exits[itemname].current_state;
    }
    
}


jsdungeon.useable = function(itemname, currentState, itemtype, currentArea){
    if(itemtype === "items"){
        return (currentArea.items[itemname].states[currentState].on_use && currentArea.items[itemname].states[currentState].on_use.triggers)
    }
    else if(itemtype === "objects"){
        return (currentArea.objects[itemname].states[currentState].on_use && currentArea.objects[itemname].states[currentState].on_use.triggers)
    }
    else if(itemtype === "exits"){
        return (currentArea.exits[itemname].states[currentState].on_use && currentArea.exits[itemname].states[currentState].on_use.triggers)
    }
}

//for use X on Y triggers
jsdungeon.trigger_action = function(item_use, item_on, triggers, currentState) {
    var notUsed = true;

    for (var i = 0; i < triggers.length; i++) {
        if (triggers[i].requires && triggers[i].requires === item_use && triggers[i].requires_state === currentState) {
            jsdungeon.process_trigger(triggers[i]);
            notUsed = false;
            if (triggers[i].single_trigger && triggers[i].single_trigger === "true") {
                triggers.splice(i, 1);
                i = i-1;
            }
        }

    }
    if (notUsed) {
        jsdungeon.output("You used {0} on {1} to no effect.".format(item_use, item_on));
    }
}



//for more basic triggers
jsdungeon.looptriggers = function(triggers){
    for(var i=0;i<triggers.length;i++){
        var shouldReturn = false;
        jsdungeon.process_trigger(triggers[i]);
        if(triggers[i].trigger_blocking && triggers[i].trigger_blocking === "true"){
            shouldReturn = true;
        }
        if(triggers[i].single_trigger && triggers[i].single_trigger === "true"){
            triggers.splice(i, 1);
            i-=1;
        }
        if(shouldReturn){
            return;
        }
    }
}


jsdungeon.check_exist = function(array, item){
    if(array && array[item]){
        return true;
    }
    else{
        return false;
    }
    
}


//This is basically all just for the context sensitive verbs. Might have to change based on verb (cause grammar changes)
jsdungeon.check_context = function(item, other){
    var check = function(){
        if(!other){
            jsdungeon.use(item);
        }
        else{
            jsdungeon.use(other,item);
        }
    }
    if(jsdungeon.getItems()[item]){
        check();
    }
    else if(jsdungeon.getCurrentRoom().objects[item]){
        check();
    }
    else if(jsdungeon.getCurrentRoom().exits[item]){
        jsdungeon.move(item);
    }
    else{
        jsdungeon.error(item);
    }
}
jsdungeon.outputString = "";

jsdungeon.interact = function(input) {
    jsdungeon.outputString = "";
    try {
        if(jsdungeon.isGameOver()){
            jsdungeon.output("Game is over. Please start a new one.");
            return jsdungeon.outputString;
        }
        if(jsdungeon.getCurrentDungeon() === null){
            jsdungeon.output("Please start a dungeon.");
            return jsdungeon.outputString;
        }
        jsdungeon.gameloop(input);
    }
    catch(err) {
        console.log(err);
        jsdungeon.output("Uh oh! There was an error!");
        return jsdungeon.outputString;
    }
    return jsdungeon.outputString;
}

jsdungeon.output = function(value) {
    jsdungeon.outputString += "<p class='entry'>" + value + "</p>";
}

jsdungeon.output_break = function(value) {
    jsdungeon.outputString += "<p class='break'/>";
}

jsdungeon.clearOutput = function(){
    jsdungeon.outputString = "";
}

jsdungeon.loadJSON = function(file, callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', file + "?nocache=" + (new Date()).getTime(), true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}
// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

/*
 * Array Remove - By John Resig (MIT Licensed)
 */
Array.prototype.remove = function(element) {
  var index = this.indexOf(element);
  if (index > -1){
    this.splice(index, 1);
  }
};

/*
 * Array Remove - By John Resig (MIT Licensed)
 */
Array.prototype.removeAll = function(element) {
  var index = this.indexOf(element);
  while (index > -1){
    this.splice(index, 1);
    var index = this.indexOf(element);
  }
};

jsdungeon.setBackgroungImage = function(image) {
    var urlString = 'url(' + image + ')';
    document.body.style.backgroundImage =  urlString;
}
/**
 * Parser for overall game interactions!
 **/
jsdungeon.reg= {
 move: /(?:move|enter|go|skedaddle|sally forth|proceed|exit(?: through)?) +(.*)/i,
 talk : /(?:talk|chat)(?: to)? +(.*)/i,
 examine : /(?:examine|check|scrutinize|look|inspect) +(.*)/i,
 take : /(?:take|grab|snatch|get|pick up) +(.*)/i,
 use : /(?:search|use|combine|try|give) +(.+?)(?: +(?:on|with|and|for|to|a) +(.+?))?$/i,
 context:/(?:open) +(.+?)(?: +(?:with|and|for|to|a) +(.+?))?$/i,
 look : /(?:look|review|survey)/i,
 inventory : /inventory/i,
 help : /help/i,
 whitespace : /\S/

}
    

jsdungeon.parseInput = function (text){
    
    
    if(jsdungeon.reg.move.test(text)){
        
        var match = jsdungeon.reg.move.exec(text);
        match = jsdungeon.castLower(match);
        jsdungeon.move(match[1]);
        
        return;
    }
    

    
    if(jsdungeon.reg.talk.test(text)){
        var match = jsdungeon.reg.talk.exec(text);
        match = jsdungeon.castLower(match);
        jsdungeon.talk(match[1]);
        
        return;
    }
    

    
    if(jsdungeon.reg.examine.test(text)){
        var match = jsdungeon.reg.examine.exec(text);
        match = jsdungeon.castLower(match);
        jsdungeon.examine(match[1]);
        
        return;
    }
    
    if(jsdungeon.reg.take.test(text)){
        var match = jsdungeon.reg.take.exec(text);
        match = jsdungeon.castLower(match);
        jsdungeon.take(match[1]);
        
        return;
    }
    if(jsdungeon.reg.use.test(text)){
        var match = jsdungeon.reg.use.exec(text);
        match = jsdungeon.castLower(match);
        jsdungeon.use(match[1],match[2]);
        return;
    }
    
    if(jsdungeon.reg.context.test(text)){
        var match = jsdungeon.reg.context.exec(text);
        match = jsdungeon.castLower(match);
        jsdungeon.check_context(match[1],match[2]);
        return;
    }
    
    
    if(jsdungeon.reg.look.test(text)){
        
        jsdungeon.look();
        
        return;
    }
    
    if(jsdungeon.reg.inventory.test(text)){
        jsdungeon.inventory();
        
        
        return;
    }
    if(jsdungeon.reg.help.test(text)){
        jsdungeon.help();
        
        return;
    }
    
    
    if(!jsdungeon.reg.whitespace.test(text)){
        return;
    }
    
    
    
    /*global output*/
     jsdungeon.output("I'm not sure how to {0}! (Type help to see commands)".format(text));    
    
    
   
}

jsdungeon.castLower = function(match){
    for(var i = 0; i<match.length; i++){
        if(match[i] !== undefined){
            match[i] = match[i].toLowerCase();
        }
    }
    return match;
}
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
/* File for handling triggers (This is going to get messy) */
jsdungeon.process_trigger = function(trigger){
    if(trigger.trigger_type === "state_change"){
        jsdungeon.trigger_change_state(trigger);
    }
    else if(trigger.trigger_type === "flavor_text"){
        jsdungeon.trigger_flavor_text(trigger);
    }
    else if(trigger.trigger_type === "lose_game"){
        jsdungeon.trigger_lose_game(trigger);
    }
    else if(trigger.trigger_type === "win_game"){
        jsdungeon.trigger_win_game(trigger);
    }
    else if(trigger.trigger_type === "add_item"){
        jsdungeon.trigger_add_item(trigger);
    }
    else if(trigger.trigger_type === "remove_item"){
        jsdungeon.trigger_remove_item(trigger);
    }
    else{
        console.log("malformed trigger");
    }
}

jsdungeon.getTargetGroup = function(trigger){
    if(trigger.target_type === "objects"){
        if(trigger.target_room){
            return jsdungeon.getObjects(trigger.target_room);
        } else {
            return jsdungeon.getObjects();
        }
    }
    if(trigger.target_type === "items"){
        return jsdungeon.getItems();
    }
    if(trigger.target_type === "exits"){
        if(trigger.target_room){
            return jsdungeon.getExits(trigger.target_room);
        } else {
            return jsdungeon.getExits();
        }
    }
}

jsdungeon.trigger_flavor_text = function(trigger){
    if(trigger.text){
        jsdungeon.output(trigger.text);
    }
    else if(trigger.description){
        jsdungeon.output(trigger.description);
    }
}

jsdungeon.trigger_change_state = function(trigger){
    var targetGroup = jsdungeon.getTargetGroup(trigger);
    if(trigger.target_state){
        if(trigger.target_state === targetGroup[trigger.target].current_state){
            jsdungeon.changestate(trigger);
        }
    }
    else{
        jsdungeon.changestate(trigger);
    }
}
jsdungeon.changestate = function(trigger){
    var targetGroup = jsdungeon.getTargetGroup(trigger);
    targetGroup[trigger.target].current_state = trigger.new_state;
    if(trigger.description){
        jsdungeon.output(trigger.description);
    }
}


jsdungeon.trigger_add_item = function(trigger){
    var item = trigger.target_item;
    jsdungeon.getCurrentDungeon().player.inventory.push(item);
    if(trigger.description){
        jsdungeon.output(trigger.description);
    }
}

jsdungeon.trigger_remove_item = function(trigger){
    var item = trigger.target_item;
    jsdungeon.getCurrentDungeon().player.inventory.remove(item);
    if(trigger.description){
        jsdungeon.output(trigger.description);
    }
}

jsdungeon.trigger_lose_game = function(trigger){
    if(trigger.description){
        jsdungeon.output("{0} Choose a dungeon and start a new game below.".format(trigger.description));
    } else {
        jsdungeon.output("You have died. Choose a dungeon and start a new game below.");
    }
    jsdungeon.endGame();
}

jsdungeon.trigger_win_game = function(trigger){
    if(trigger.description){
        jsdungeon.output("{0} Choose a dungeon and start a new game below.".format(trigger.description));
    } else {
        jsdungeon.output("Congratulations! You've completed the dungeon. Start a new game below.");
    }
    jsdungeon.endGame();
}