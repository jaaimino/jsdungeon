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