/* File for handling triggers (This is going to get messy) */
function process_trigger(trigger){
    if(trigger.type === "state_change"){
        trigger_change_state(trigger);
    }
}

function trigger_change_state(trigger){
    currentDungeon[trigger.target_type][trigger.target].current_state = trigger.new_state;
    output(trigger.description);
    //console.log(currentDungeon);
}