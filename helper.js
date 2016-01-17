

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

function trigger_action(item_use, item_on, triggers, currentState) {
    var notUsed = true;
    for (var i = 0; i < triggers.length; i++) {
        if (triggers[i].requires && triggers[i].requires === item_use && triggers[i].requires_state === currentState) {
            process_trigger(triggers[i]);
            notUsed = false;
        }
        if (triggers[i].single_trigger && triggers[i].single_trigger === "true") {
            triggers.splice(i, 1);
        }
    }
    if (notUsed) {
        output("You used {0} on {1} to no effect.".format(item_use, item_on));
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