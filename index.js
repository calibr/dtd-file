var EventEmitter = require("events");
var util = require("util");

function SimpleApiParser() {
  EventEmitter.call(this);

  this.inValue = false;
  this.inEntity = false;
  this.index = 0;
  this.string = null;
  this.end = false;
  this._space = /\s/;
}
util.inherits(SimpleApiParser, EventEmitter);

SimpleApiParser.prototype._checkUnexpectedDocEnd = function() {
  if(this.index >= this.length) {
    throw new Error("Unexpected document end");
  }
}

SimpleApiParser.prototype._skipSpaces = function() {
  for(;;) {
    this.index++;
    this._checkUnexpectedDocEnd();
    if(!this._space.test(this.string[this.index])) {
      break;
    }
  }
}

SimpleApiParser.prototype._readUntil = function(char) {
  for(;;) {
    this.index++;
    this._checkUnexpectedDocEnd();
    if(this.string[this.index] === char) {
      break;
    }
  }
  this.index--;
}

SimpleApiParser.prototype._getNext = function(n) {
  if(n <= 0) {
    return "";
  }
  var res = "";
  while(n--) {
    res += this.string[this.index];
    this.index++;
  }
  return res;
}

SimpleApiParser.prototype._next = function () {
  var char;
  if (this.index === 0) {
    this.emit("document_start");
  }
  if (this.index >= this.string.length) {
    this.end = true;
    return this.emit("document_end");
  }
  var symbol = this.string[this.index];
  if (symbol === "<") {
    this.index++;
    var next7Symbols = this._getNext(7);
    if(next7Symbols.toLowerCase() !== "!entity") {
      throw new Error("Expected !entity, got \"" + next7Symbols + "(" + next7Symbols.toLowerCase() + ")\"");
    }
    // reading entity name
    // first of skip space chars
    this._skipSpaces();
    // reading entity name until space
    var entityName = "";
    for (;;) {
      this._checkUnexpectedDocEnd();
      char = this.string[this.index];
      if(this._space.test(char)) {
        break;
      }
      this.index++;
      entityName += char;
    }
    this.inEntity = true;
    this.entityValueQuote = false;
    this.emit("entity_name", entityName);
    this._skipSpaces();
    char = this.string[this.index];
    var entityValueQuote = null;
    if (char === '"' || char === "'") {
      entityValueQuote = char;
    }
    var value = "";
    var symbolEscaped = false;
    var addChar;
    for (;;) {
      addChar = true;
      this.index++;
      this._checkUnexpectedDocEnd();
      char = this.string[this.index];
      if(entityValueQuote) {
        if (!symbolEscaped && char === entityValueQuote) {
          break;
        }
      } else if (this._space.test(char)) {
        this._readUntil(">");
        break;
      } else if (char === ">") {
        break;
      }
      if (symbolEscaped) {
        symbolEscaped = false;
      } else if (entityValueQuote && char === '\\') {
        var nextSymbol = this.string[this.index + 1];
        if(nextSymbol === entityValueQuote) {
          symbolEscaped = true;
          addChar = false;
        }
      }
      if(addChar) {
        value += char;
      }
    }
    this.emit("entity_value", value);
  }
  this.index++;
};

SimpleApiParser.prototype.parse = function(str) {
  this.string = str;
  var i = 0;
  while (!this._end) {
    i++;
    if(i > this.string.length) {
      break;
    }
    this._next();
  }
};

exports.parse = function(string) {
  var parser = new SimpleApiParser();
  var res = {};
  var currentName;
  parser.on("entity_name", function(name) {
    currentName = name;
  });
  parser.on("entity_value", function(value) {
    res[currentName] = value;
  });
  parser.parse(string);
  return res;
};

exports.stringify = function(object) {
  var strings = [];
  for(var key in object) {
    var value = object[key].replace(/"/g, "\\\"");
    strings.push('<!ENTITY ' + key + ' "' + value + '">');
  }
  return strings.join("\n");
};