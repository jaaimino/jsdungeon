var select = document.getElementById("adventureSelect"); 
loadJSON("dungeons.json", function(response){
   var response_json = JSON.parse(response);
   var dungeons = response_json.dungeons;
   for (var i=0;i<dungeons.length;i++) {
    var opt = dungeons[i];
    var el = document.createElement("option");
        el.textContent = opt.name;
        el.value = opt.filename;
        select.appendChild(el);
    }
});

function chooseAdventure(){
    try{
        var select = document.getElementById("adventureSelect");
        var filename = select.options[select.selectedIndex].value;
        loadJSON(filename, function(response){
           var new_response_json = JSON.parse(response);
           startGame(new_response_json);
           return false;
        });
        return false;
    } catch(err){
        console.log(err);
        return false;
    }
}