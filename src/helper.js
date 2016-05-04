

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