/* File for handling triggers (This is going to get messy) */
function process_trigger(currentDungeon, trigger){
    if(trigger.trigger_type === "state_change"){
        trigger_change_state(currentDungeon, trigger);
    }
    if(trigger.trigger_type === "lose_game"){
        trigger_lose_game(trigger);
    }
    if(trigger.trigger_type === "win_game"){
        trigger_win_game(trigger);
    }
}

function trigger_change_state(currentDungeon, trigger){
    currentDungeon[trigger.target_type][trigger.target].current_state = trigger.new_state;
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