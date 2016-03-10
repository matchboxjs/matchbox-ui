var assert = require("chai").assert
var ui = require("../../index")

var dom = ui.dom

describe("data", function () {
  function test (name, fn) {
    it(name, function () {
      var element = document.createElement("div")
      document.body.appendChild(element)
      fn.call(this, element)
      document.body.removeChild(element)
    })
  }

  function tryCatch (data, element, value) {
    var thrown = false
    try {
      data.set(element, value)
    }
    catch (e) {
      thrown = true
    }
    assert.isTrue(thrown)
  }

  function testDefault (DataType, defaultValue) {
    test("with default", function (element) {
      var data = new DataType("data", defaultValue)
      assert.equal(data.get(element), defaultValue)
      assert.isFalse(data.has(element))
      assert.isFalse(element.hasAttribute(data.name))
    })
    test("with no default", function (element) {
      var data = new DataType("data")
      assert.isNull(data.get(element))
      assert.isFalse(data.has(element))
      assert.isFalse(element.hasAttribute(data.name))
    })
  }

  function testType (DataType, testValue, invalidValues) {
    testDefault(DataType, testValue)
    test("set to valid", function (element) {
      var data = new DataType("data")
      data.set(element, testValue)
      assert.equal(data.get(element), testValue)
      assert.isTrue(element.hasAttribute(data.attributeName()))
      data.remove(element)
      assert.isFalse(element.hasAttribute(data.attributeName()))
    })
    test("set to invalid", function (element) {
      var data = new DataType("data")
      invalidValues.forEach(function (invalidValue) {
        tryCatch(data, element, invalidValue)
      })
    })
    test("remove", function (element) {
      var data = new DataType("data")
      assert.isFalse(data.has(element))
      data.remove(element)
      assert.isFalse(data.has(element))
      data.set(element, testValue)
      assert.isTrue(data.has(element))
    })
  }

  function testJSON (testValue, invalidValues) {
    testDefault(dom.data.JSON, testValue)
    test("set to valid", function (element) {
      var data = new dom.data.JSON("data")
      data.set(element, testValue)
      assert.equal(element.hasAttribute(data.attributeName()), true)
      assert.equal(element.getAttribute(data.attributeName()), JSON.stringify(testValue))
      data.remove(element)
      assert.equal(element.hasAttribute(data.attributeName()), false)
    })
    test("set to invalid", function (element) {
      var data = new dom.data.JSON("data")
      invalidValues.forEach(function (invalidValue) {
        tryCatch(data, element, invalidValue)
      })
    })
    test("remove", function (element) {
      var data = new dom.data.JSON("data")
      assert.isFalse(data.has(element))
      data.remove(element)
      assert.isFalse(data.has(element))
      data.set(element, testValue)
      assert.isTrue(data.has(element))
    })
  }

  describe("create", function () {
    it("boolean", function () {
      assert.instanceOf(dom.data.create("data", true), dom.data.Boolean)
    })
    it("string", function () {
      assert.instanceOf(dom.data.create("data", "string"), dom.data.String)
    })
    it("number", function () {
      assert.instanceOf(dom.data.create("data", 0), dom.data.Number)
      assert.instanceOf(dom.data.create("data", 1.0), dom.data.Number)
    })
    it("float", function () {
      assert.instanceOf(dom.data.create("data", 1.1), dom.data.Float)
    })
    it("json", function () {
      assert.instanceOf(dom.data.create("data", {}), dom.data.JSON)
      assert.instanceOf(dom.data.create("data", []), dom.data.JSON)
    })
    it("null", function () {
      assert.isNull(dom.data.create("data"))
    })
  })

  describe("BooleanData", function () {
    describe("true", function () {
      testType(dom.data.Boolean, true, [null, 1, "", {}, []])
    })
    describe("false", function () {
      testType(dom.data.Boolean, false, [null, 1, "", {}, []])
    })
  })

  describe("StringData", function () {
    describe("string", function () {
      testType(dom.data.String, "test", [null, 1, true, false, {}, []])
    })
    describe("empty string", function () {
      testType(dom.data.String, "", [null, 1, true, false, {}, []])
    })
  })

  describe("NumberData", function () {
    describe("zero", function () {
      testType(dom.data.Number, 0, [null, true, false, "", {}, []])
    })
    describe("non zero", function () {
      testType(dom.data.Number, -1, [null, true, false, "", {}, []])
    })
  })

  describe("FloatData", function () {
    describe("zero", function () {
      testType(dom.data.Float, 0, [null, true, false, "", {}, []])
    })
    describe("non zero", function () {
      testType(dom.data.Float, -1.1, [null, true, false, "", {}, []])
    })
  })

  describe("JSONData", function () {
    describe("object", function () {
      testJSON({}, [null])
    })
    describe("array", function () {
      testJSON([0,"test",true], [null])
    })
    describe("number", function () {
      testJSON(-1.1, [null])
    })
    describe("boolean", function () {
      testJSON(true, [null])
    })
  })
})
