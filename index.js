exports.parse = function(string) {
  var object = {};
  string.split(/(\n|\r\n)/).forEach(function(s) {
    s = s.trim();
    if(!s) {
      return;
    }
    var m = s.match(/<!entity\s+(.+?)\s+(.+?)>$/i);
    if(!m) {
      return;
    }
    var key = m[1];
    var value = m[2];
    if(value[0] === "\"" || value[0] === "'") {
      var quote = value[0];
      value = value.substr(1, value.length - 2);
      value = value.replace(new RegExp("\\\\" + quote, "g"), quote);
    }
    object[key] = value;
  });
  return object;
};

exports.stringify = function(object) {
  var strings = [];
  for(var key in object) {
    var value = object[key].replace(/"/g, "\\\"");
    strings.push('<!ENTITY ' + key + ' "' + value + '">');
  }
  return strings.join("\n");
};