/**
 * Parser for overall game interactions!
 **/
jsdungeon.reg= {
 move: /(?:move|enter|go|skedaddle|sally forth|proceed|exit(?: through)?) +(.*)/i,
 talk : /(?:talk|chat)(?: to)? +(.*)/i,
 examine : /(?:examine|check|scrutinize|look|inspect) +(.*)/i,
 take : /(?:take|grab|snatch|get|pick up) +(.*)/i,
 use : /(?:search|use|combine|try|give) +(.+?)(?: +(?:on|with|and|for|to|a) +(.+?))?$/i,
 context:/(?:open) +(.+?)(?: +(?:with|and|for|to|a) +(.+?))?$/i,
 look : /(?:look|review|survey)/i,
 inventory : /inventory/i,
 help : /help/i,
 whitespace : /\S/

}
    

jsdungeon.parseInput = function (text){
    
    if(jsdungeon.reg.move.test(text)){
        
        var match = jsdungeon.reg.move.exec(text);
        jsdungeon.move(match[1]);
        
        return;
    }
    

    
    if(jsdungeon.reg.talk.test(text)){
        var match = jsdungeon.reg.talk.exec(text);
        jsdungeon.talk(match[1]);
        
        return;
    }
    

    
    if(jsdungeon.reg.examine.test(text)){
        var match = jsdungeon.reg.examine.exec(text);
        jsdungeon.examine(match[1]);
        
        return;
    }
    
    if(jsdungeon.reg.take.test(text)){
        var match = jsdungeon.reg.take.exec(text);
        jsdungeon.take(match[1]);
        
        return;
    }
    if(jsdungeon.reg.use.test(text)){
        var match = jsdungeon.reg.use.exec(text);
        jsdungeon.use(match[1],match[2]);
        return;
    }
    
    if(jsdungeon.reg.context.test(text)){
        var match = jsdungeon.reg.context.exec(text);
        jsdungeon.check_context(match[1],match[2]);
        return;
    }
    
    
    if(jsdungeon.reg.look.test(text)){
        jsdungeon.look();
        
        return;
    }
    
    if(jsdungeon.reg.inventory.test(text)){
        jsdungeon.inventory();
        
        
        return;
    }
    if(jsdungeon.reg.help.test(text)){
        jsdungeon.help();
        
        return;
    }
    
    
    if(!jsdungeon.reg.whitespace.test(text)){
        return;
    }
    
    
    
    /*global output*/
     jsdungeon.output("I'm not sure how to {0}! (Type help to see commands)".format(text));    
    
    
   
}