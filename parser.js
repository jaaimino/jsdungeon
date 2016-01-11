function parseInput(text){
    
    /*
    var myRegs = [/look (.*)/g,/move (.*)/g];
    var findKey = true;
    
    var myArray = myRe.exec(text);
    while(findKey){
        
        
        if(myArray[1]){
            
        }    
    }
    */
    
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
    
    output("Invalid command {0}! (Type help to see commands)".format(myArray));
}