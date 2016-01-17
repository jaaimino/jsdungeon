/* File for handling triggers (This is going to get messy) */
function process_trigger(trigger){
    if(trigger.trigger_type === "state_change"){
        trigger_change_state(trigger);
    }
    if(trigger.trigger_type === "lose_game"){
        trigger_lose_game(trigger);
    }
    if(trigger.trigger_type === "win_game"){
        trigger_win_game(trigger);
    }
    if(trigger.trigger_type === "add_item"){
        trigger_add_item(trigger);
    }
    if(trigger.trigger_type === "remove_item"){
        trigger_remove_item(trigger);
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

function trigger_change_state(trigger){
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