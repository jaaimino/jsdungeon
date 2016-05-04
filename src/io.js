jsdungeon.outputString = "";

jsdungeon.interact = function(input) {
    jsdungeon.outputString = "";
    try {
        if(jsdungeon.isGameOver()){
            jsdungeon.output("Game is over. Please start a new one.");
            return jsdungeon.outputString;
        }
        if(jsdungeon.getCurrentDungeon() === null){
            jsdungeon.output("Please start a dungeon.");
            return jsdungeon.outputString;
        }
        jsdungeon.gameloop(input);
    }
    catch(err) {
        console.log(err);
        jsdungeon.output("Uh oh! There was an error!");
        return jsdungeon.outputString;
    }
    return jsdungeon.outputString;
}

jsdungeon.output = function(value) {
    jsdungeon.outputString += "<p class='entry'>" + value + "</p>";
}

jsdungeon.output_break = function(value) {
    jsdungeon.outputString += "<p class='break'/>";
}

jsdungeon.clearOutput = function(){
    jsdungeon.outputString = "";
}

jsdungeon.loadJSON = function(file, callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', file + "?nocache=" + (new Date()).getTime(), true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}