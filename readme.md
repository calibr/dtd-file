# Just parse DTD files, especially created for Firefox localization DTD files

## Install

`npm i dtd-file`

## Usage

### Parse dtd contents

```js
var parser = require("dtd-file");

var res = parser.parse(dtdContents);
// if in dtdContents you have:
// <!entity key1 "value1">
// <!entity key2 "value2">
// in res you will get an object:
// {
//   "key1": "value1",
//   "key2": "value2"
// }
```

### Stringify object to DTD file contents

```js
var parser = require("dtd-file");

var res = parser.stringify({
  key1: "value1",
  key2: "value2"
});
// in res you will get
// <!ENTITY key1 "value1">
// <!ENTITY key2 "value2">
```