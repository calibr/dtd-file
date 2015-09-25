var
  parser = require("../index"),
  fs = require("fs"),
  should = require("should");

describe("Common", function() {
  it("should parse dtd file", function() {
    var raw = fs.readFileSync(__dirname + "/test.dtd", "utf8");
    var result = parser.parse(raw);
    var str = parser.stringify(result);
    str.should.equal(fs.readFileSync(__dirname + "/test_res.dtd", "utf8"));
  });

  it("should parse file with escaped double quotes", function() {
    var dtd = '<!entity test "test \\"hello\\" string">';
    var result = parser.parse(dtd);
    result.test.should.equal('test "hello" string');
  });

  it("should parse file with escaped single quotes", function() {
    var dtd = "<!entity test 'test \\'hello\\' string'>";
    var result = parser.parse(dtd);
    result.test.should.equal("test 'hello' string");
  });

  it("should not unescape single quotes if string quoted in double quotes", function() {
    var dtd = '<!entity test "test \\\'hello\\\' string">';
    var result = parser.parse(dtd);
    result.test.should.equal("test \\'hello\\' string");
  });

  it("should not unescape double quotes if string quoted in single quotes", function() {
    var dtd = "<!entity test 'test \\\"hello\\\" string'>";
    var result = parser.parse(dtd);
    result.test.should.equal('test \\"hello\\" string');
  });

  it("should stringify object", function() {
    var object = {
      key1: "value1 with \"text\" test",
      key2: "value2''xxx"
    };
    var str = parser.stringify(object);
    str.should.equal('<!ENTITY key1 "value1 with \\"text\\" test">\n<!ENTITY key2 "value2\'\'xxx">');
  });
});