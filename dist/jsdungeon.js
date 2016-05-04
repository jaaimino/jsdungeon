/**
 * jsdungeon - JSdungeon is a text-based adventure game engine. You can create your own dungeons by configuring them in JSON. Examples are in the repository, and you're free to take a modify them for your own use.
 * @version v1.1.0
 * @link https://github.com/jaaimino/jsdungeon#readme
 * @license ISC
 */
var select = document.getElementById("adventureSelect"); 
loadJSON("dungeons.json", function(response){
   var response_json = JSON.parse(response);
   var dungeons = response_json.dungeons;
   for (var i=0;i<dungeons.length;i++) {
    var opt = dungeons[i];
    var el = document.createElement("option");
        el.textContent = opt.name;
        el.value = opt.filename;
        select.appendChild(el);
    }
});

function chooseAdventure(){
    try{
        var select = document.getElementById("adventureSelect");
        var filename = select.options[select.selectedIndex].value;
        loadJSON(filename, function(response){
           var new_response_json = JSON.parse(response);
           startGame(new_response_json);
           return false;
        });
        return false;
    } catch(err){
        console.log(err);
        return false;
    }
}
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
            if(getCurrentRoom().objects[key].states[objectState].description){//checking for description allows for easy linking/hiding of things without descriptions.
                outputString += getCurrentRoom().objects[key].states[objectState].description + " ";
            }
        }
    }
    if (getCurrentRoom().items) {
        for (var i = 0; i < getCurrentRoom().items.length; i++) {
            var item = getCurrentRoom().items[i];
            var itemState = getCurrentDungeon().items[item].current_state;
            if(getCurrentDungeon().items[item].states[itemState].description){
                outputString += getCurrentDungeon().items[item].states[itemState].description + " ";
            }
        }
    }
    for (var key in getCurrentRoom().exits) {
        if (getCurrentRoom().exits.hasOwnProperty(key)) {
            var roomState = getCurrentRoom().exits[key].current_state;
            if(getCurrentRoom().exits[key].states[roomState].description){//made this one optional so we can have hidden doors until a trigger happens.
                outputString += getCurrentRoom().exits[key].states[roomState].description + " ";
            }
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
            looptriggers(currentExit.on_enter.triggers);
            
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
            output("You can't do anything to {0} with {1}.".format(item_on, item_use));
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

        
        lookatthing(currentExit);
        

    }
    else {
        output("There's nothing in this room like that!");
    }
}

function lookatthing(currentThing){
    
    if(currentThing.on_examine){
        var noprint = true;
        if(currentThing.on_examine.description){
            output(currentThing.on_examine.description);
            noprint = false;
        }
        if(currentThing.on_examine.triggers){
            looptriggers(currentThing.on_examine.triggers);
            noprint = false;
        }
        if(noprint){
            output("There doesn't seem to be anything interesting about {0}...".format(currentThing));
        }
        
    }
    //leaving this in for legacy purposes todo:revamp all adventures to use new version DON'T MENTION THIS STYLE IN THE DOCUMENTATION
    else if (currentThing.examination) {
        output(currentThing.examination);

    }
    else {
        output("There doesn't seem to be anything interesting about {0}...".format(currentThing));
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
            looptriggers(currentPerson.on_talk.triggers);
            
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


function error(item){
    output("{0} doesn't exist here!".format(item));
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


function getCurrentState(itemname, itemtype,currentArea){
    
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


function useable(itemname, currentState, itemtype, currentArea){
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
function trigger_action(item_use, item_on, triggers, currentState) {
    var notUsed = true;

    for (var i = 0; i < triggers.length; i++) {
        if (triggers[i].requires && triggers[i].requires === item_use && triggers[i].requires_state === currentState) {
            process_trigger(triggers[i]);
            notUsed = false;
            if (triggers[i].single_trigger && triggers[i].single_trigger === "true") {
                triggers.splice(i, 1);
                i = i-1;
            }
        }

    }
    if (notUsed) {
        output("You used {0} on {1} to no effect.".format(item_use, item_on));
    }
}



//for more basic triggers
function looptriggers(triggers){
    for(var i=0;i<triggers.length;i++){
        var shouldReturn = false;
        process_trigger(triggers[i]);
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


function check_exist(array, item){
    if(array && array[item]){
        return true;
    }
    else{
        return false;
    }
    
}


//This is basically all just for the context sensitive verbs. Might have to change based on verb (cause grammar changes)
function check_context(item, other){
    var check = function(){
        if(!other){
            use(item);
        }
        else{
            use(other,item);
        }
    }
    if(getItems()[item]){
        check();
    }
    else if(getCurrentRoom().objects[item]){
        check();
    }
    else if(getCurrentRoom().exits[item]){
        move(item);
    }
    else{
        error(item);
    }
}
function sendInput() {
    try {
        if(isGameOver()){
            output("Game is over. Please start a new one.");
            clearInputBox();
            scrollToBottom();
            return false;
        }
        if(getCurrentDungeon() === null){
            output("Please start a dungeon below.");
            clearInputBox();
            scrollToBottom();
            return false;
        }
        gameloop(getInput());
        clearInputBox();
        scrollToBottom();
    }
    catch(err) {
        console.log(err);
        output("Uh oh! There was an error!");
        clearInputBox();
        return false;
    }
    return false;
}

function getInput() {
    return document.getElementById("inputBox").value;
}

function scrollToBottom() {
    var element = document.getElementById("output");
    element.scrollTop = element.scrollHeight;
}

function clearInputBox() {
    document.getElementById("inputBox").value = "";
}

function output(value) {
    document.getElementById("output").innerHTML += "<p class='entry'>" + value + "</p>";
}

function output_break(value) {
    document.getElementById("output").innerHTML += "<p class='break'/>";
}

function clearOutput(){
    document.getElementById("output").innerHTML = "";
}

function loadJSON(file, callback) {

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

function setBackgroungImage(image) {
    var urlString = 'url(' + image + ')';
    document.body.style.backgroundImage =  urlString;
}




var reg= {
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
    

function parseInput(text){
    
    if(reg.move.test(text)){
        
        var match = reg.move.exec(text);
        move(match[1]);
        
        return;
    }
    

    
    if(reg.talk.test(text)){
        var match = reg.talk.exec(text);
        talk(match[1]);
        
        return;
    }
    

    
    if(reg.examine.test(text)){
        var match = reg.examine.exec(text);
        examine(match[1]);
        
        return;
    }
    
    if(reg.take.test(text)){
        var match = reg.take.exec(text);
        take(match[1]);
        
        return;
    }
    if(reg.use.test(text)){
        var match = reg.use.exec(text);
        use(match[1],match[2]);
        return;
    }
    
    if(reg.context.test(text)){
        var match = reg.context.exec(text);
        check_context(match[1],match[2]);
        return;
    }
    
    
    if(reg.look.test(text)){
        look();
        
        return;
    }
    
    if(reg.inventory.test(text)){
        inventory();
        
        
        return;
    }
    if(reg.help.test(text)){
        help();
        
        return;
    }
    
    
    if(!reg.whitespace.test(text)){
        return;
    }
    
    
    
    /*global output*/
     output("I'm not sure how to {0}! (Type help to see commands)".format(text));    
    
    
   
}
function saveGame(dungeonName, currentDungeon){
    currentDungeon.currentPlayer = getCurrentPlayer();
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
/* File for handling triggers (This is going to get messy) */
function process_trigger(trigger){
    if(trigger.trigger_type === "state_change"){
        trigger_change_state(trigger);
    }
    else if(trigger.trigger_type === "flavor_text"){
        trigger_flavor_text(trigger);
    }
    else if(trigger.trigger_type === "lose_game"){
        trigger_lose_game(trigger);
    }
    else if(trigger.trigger_type === "win_game"){
        trigger_win_game(trigger);
    }
    else if(trigger.trigger_type === "add_item"){
        trigger_add_item(trigger);
    }
    else if(trigger.trigger_type === "remove_item"){
        trigger_remove_item(trigger);
    }
    else{
        console.log("malformed trigger");
    }
}

function getTargetGroup(trigger){
    if(trigger.target_type === "objects"){
        if(trigger.target_room){
            return getObjects(trigger.target_room);
        } else {
            return getObjects();
        }
    }
    if(trigger.target_type === "items"){
        return getItems();
    }
    if(trigger.target_type === "exits"){
        if(trigger.target_room){
            return getExits(trigger.target_room);
        } else {
            return getExits();
        }
    }
}

function trigger_flavor_text(trigger){
    if(trigger.text){
        output(trigger.text);
    }
    else if(trigger.description){
        output(trigger.description);
    }
}

function trigger_change_state(trigger){
    var targetGroup = getTargetGroup(trigger);
    if(trigger.target_state){
        if(trigger.target_state === targetGroup[trigger.target].current_state){
            changestate(trigger);
        }
    }
    else{
        changestate(trigger);
    }
}
function changestate(trigger){
    var targetGroup = getTargetGroup(trigger);
    targetGroup[trigger.target].current_state = trigger.new_state;
    if(trigger.description){
        output(trigger.description);
    }
}


function trigger_add_item(trigger){
    var item = trigger.target_item;
    getCurrentDungeon().player.inventory.push(item);
    if(trigger.description){
        output(trigger.description);
    }
}

function trigger_remove_item(trigger){
    var item = trigger.target_item;
    getCurrentDungeon().player.inventory.remove(item);
    if(trigger.description){
        output(trigger.description);
    }
}

function trigger_lose_game(trigger){
    if(trigger.description){
        output("{0} Choose a dungeon and start a new game below.".format(trigger.description));
    } else {
        output("You have died. Choose a dungeon and start a new game below.");
    }
    endGame();
}

function trigger_win_game(trigger){
    if(trigger.description){
        output("{0} Choose a dungeon and start a new game below.".format(trigger.description));
    } else {
        output("Congratulations! You've completed the dungeon. Start a new game below.");
    }
    endGame();
}