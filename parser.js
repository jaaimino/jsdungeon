
var reg= {

 move: /(?:move|go|skedaddle|sally forth|proceed|exit(?: through)?) (.*)/i,
 talk : /(?:talk|chat) (.*)/i,
 examine : /(?:examine|check|scrutinize|look|inspect) (.*)/i,
 take : /(?:take|grab|snatch|get|pick up) (.*)/i,
 use : /(?:use|combine|try) (.+?)(?: (?:on|with|and) (.+?))?$/i,
 look : /(?:look|review|survey)/i,
 inventory : /inventory/i,
 help : /help/i,
 whitespace : /\S/

}
    

function parseInput(text){
    


    
    if(reg.move.test(text)){
        
        var match = reg.move.exec(text);
        move(match[1]);
        
        return;
    }
    

    
    if(reg.talk.test(text)){
        var match = reg.talk.exec(text);
        talk(match[1]);
        
        return;
    }
    

    
    if(reg.examine.test(text)){
        var match = reg.examine.exec(text);
        examine(match[1]);
        
        return;
    }
    
    if(reg.take.test(text)){
        var match = reg.take.exec(text);
        take(match[1]);
        
        return;
    }
    if(reg.use.test(text)){
        var match = reg.use.exec(text);
        use(match[1],match[2]);
        return;
    }
    
    
    if(reg.look.test(text)){
        look();
        
        return;
    }
    
    if(reg.inventory.test(text)){
        inventory();
        
        
        return;
    }
    if(reg.help.test(text)){
        help();
        
        return;
    }
    
    
    if(!reg.whitespace.test(text)){
        return;
    }
    
    
    
    /*global output*/
     output("I'm not sure how to {0}! (Type help to see commands)".format(text));    
    
    
   
}