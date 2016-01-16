

function getCurrentState(itemname, itemtype,currentArea){
    
    if(itemtype ==="item"){
        return currentArea.items[itemname].current_state;
    }
    
    else if(itemtype ==="object"){
        return currentArea.objects[itemname].current_state;
    }
    else if(itemtype === "exit"){
        return currentArea.exits[itemname].current_state;
    }
    
}

function useable(itemname, currentState, itemtype, currentArea){
    if(itemtype === "item"){
        return (currentArea.items[itemname].states[currentState].on_use && currentArea.items[itemname].states[currentState].on_use.triggers)
    }
    else if(itemtype === "object"){
        return (currentArea.objects[itemname].states[currentState].on_use && currentArea.objects[itemname].states[currentState].on_use.triggers)
    }
    else if(itemtype === "exit"){
        return (currentArea.exits[itemname].states[currentState].on_use && currentArea.exits[itemname].states[currentState].on_use.triggers)
    }
}