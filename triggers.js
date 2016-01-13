/* File for handling triggers (This is going to get messy) */
function process_trigger(currentDungeon, trigger){
    if(trigger.trigger_type === "state_change"){
        trigger_change_state(currentDungeon, trigger);
    }
}

function trigger_change_state(currentDungeon, trigger){
    currentDungeon[trigger.target_type][trigger.target].current_state = trigger.new_state;
    if(trigger.description){
        output(trigger.description);
    }
}