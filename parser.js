function parseInput(text){
    
   
    var reg_move = /move (.*)/i;
    var reg_talk = /talk (.*)/i;
    var reg_examine = /examine (.*)/i;
    var reg_take = /take (.*)/i;
    var reg_look = /look/i;
    var reg_inventory = /inventory/i;
    var reg_help = /help/i;
    

    
    if(reg_move.test(text)){
        var match = reg_move.exec(text);
        output(match);
        move(match[1]);
        
        return;
    }
    

    
    if(reg_talk.test(text)){
        var match = reg_talk.exec(text);
        talk(match[1]);
        
        return;
    }
    

    
    if(reg_examine.test(text)){
        var match = reg_examine.exec(text);
        examine(match[1]);
        
        return;
    }
    
    if(reg_take.test(text)){
        var match = reg_take.exec(text);
        take(match[1]);
        
        return;
    }
    
    if(reg_look.test(text)){
        look();
        
        return;
    }
    
    if(reg_inventory.test(text)){
        inventory();
        
        
        return;
    }
    if(reg_help.test(text)){
        help();
        
        return;
    }
    
    /*global output*/
     output("Invalid command {0}! (Type help to see commands)".format(text));    
    
    
    
        
      
    
    /*
    var split = text.split(" ");
    if(split.length > 0 && split[0] === "inventory"){
        inventory();
        return;
    }
    if(split.length > 0 && split[0] === "look"){
        look();
        return;
    }
    if(split.length > 0 && split[0] === "go" && split[1]){
        move(split[1]);
        return;
    }
    */
    
   
}