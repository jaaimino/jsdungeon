

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