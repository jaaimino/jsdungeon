function parseInput(text){
    
   
    var reg_move = /(?:move|go|skedaddle|sally forth|proceede) (.*)/i;
    var reg_talk = /(?:talk|chat) (.*)/i;
    var reg_examine = /(?:examine|check|scrutinize) (.*)/i;
    var reg_take = /(?:take|grab|snatch) (.*)/i;
    var reg_use = /use (.*) on (.*)/i;
    var reg_look = /(?:look|review|survey)/i;
    var reg_inventory = /inventory/i;
    var reg_help = /help/i;
    var whitespace = /\S/;
    

    
    if(reg_move.test(text)){
        
        var match = reg_move.exec(text);
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
    if(reg_use.test(text)){
        var match = reg_use.exec(text);
        use(match[1],match[2]);
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
    
    
    if(!whitespace.test(text)){
        return;
    }
    
    
    
    /*global output*/
     output("I'm not sure how to {0}! (Type help to see commands)".format(text));    
    
    
   
}