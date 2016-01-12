function myFunction() {
    try {
        gameloop(getInput());
        clearInputBox();
        scrollToBottom();
    }
    catch(err) {
        console.log(err);
        output("Uh oh! There was an error!");
        clearInputBox();
        return false;
    }
    return false;
}

function getInput() {
    return document.getElementById("inputBox").value;
}

function scrollToBottom() {
    var element = document.getElementById("output");
    element.scrollTop = element.scrollHeight;
}

function clearInputBox() {
    document.getElementById("inputBox").value = "";
}

function output(value) {
    document.getElementById("output").innerHTML += "<br>" + value;
}

function loadJSON(file, callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', file, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}