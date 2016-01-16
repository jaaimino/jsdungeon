// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

/*
 * Array Remove - By John Resig (MIT Licensed)
 */
Array.prototype.remove = function(element) {
  var index = this.indexOf(element);
  if (index > -1){
    this.splice(index, 1);
  }
};

/*
 * Array Remove - By John Resig (MIT Licensed)
 */
Array.prototype.removeAll = function(element) {
  var index = this.indexOf(element);
  while (index > -1){
    this.splice(index, 1);
    var index = this.indexOf(element);
  }
};