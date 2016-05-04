var outputString = "";

function interact(input) {
    outputString = "";
    try {
        if(isGameOver()){
            output("Game is over. Please start a new one.");
            return outputString;
        }
        if(getCurrentDungeon() === null){
            output("Please start a dungeon.");
            return outputString;
        }
        gameloop(input);
    }
    catch(err) {
        console.log(err);
        output("Uh oh! There was an error!");
        return outputString;
    }
    return outputString;
}

function output(value) {
    outputString += "<p class='entry'>" + value + "</p>";
}

function output_break(value) {
    outputString += "<p class='break'/>";
}

function clearOutput(){
    outputString = "";
}

function loadJSON(file, callback) {

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