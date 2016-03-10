var assert = require("chai").assert
var ui = require("../../index")

var dom = ui.dom

function test(name, id, className, attributes, fn) {
  it(name, function() {
    var element = createElement("div", id, className, attributes)
    document.body.appendChild(element)
    fn.call(this, element)
    document.body.removeChild(element)
  })
}

function createElement(tag, id, className, attributes) {
  var element = document.createElement(tag)
  element.id = id || ""
  element.className = className || ""
  for (var name in attributes) {
    element.setAttribute(name, attributes[name])
  }
  return element
}

describe("Selector", function() {
  it("basic", function() {
    var selector = new dom.Selector({
      attribute: "data-test",
      value: "test",
      operator: "="
    })
    assert.equal(selector.toString(), '[data-test="test"]')
  })
  it("id", function() {
    var selector = new dom.Selector({
      attribute: "id",
      value: "test"
    })
    assert.equal(selector.toString(), '#test')
  })
  it("class", function() {
    var selector = new dom.Selector({
      attribute: "class",
      value: "test"
    })
    assert.equal(selector.toString(), '.test')
  })
  it("element", function() {
    var selector = new dom.Selector({
      attribute: "",
      value: "test"
    })
    assert.equal(selector.toString(), 'test')

    selector = new dom.Selector({
      value: "test"
    })
    assert.equal(selector.toString(), 'test')
  })
  it("extra", function() {
    var selector = new dom.Selector({
      attribute: "",
      value: "",
      extra: "HELLO"
    })
    assert.equal(selector.toString(), 'HELLO')

    selector = new dom.Selector({
      value: "",
      extra: "HELLO"
    })
    assert.equal(selector.toString(), 'HELLO')

    selector = new dom.Selector({
      extra: "HELLO"
    })
    assert.equal(selector.toString(), 'HELLO')
  })
  it("value", function() {
    var selector = new dom.Selector({
      attribute: "data-test",
      value: "test"
    })

    assert.equal(selector.equal().toString(), '[data-test]')
    assert.equal(selector.equal(true).toString(), '[data-test]')
    assert.equal(selector.equal(false).toString(), '[data-test]')
    assert.equal(selector.equal(null).toString(), '[data-test]')
    assert.equal(selector.equal("").toString(), '[data-test]')
    assert.equal(selector.equal(0).toString(), '[data-test="0"]')
    assert.equal(selector.equal("0").toString(), '[data-test="0"]')
  })
  it("clone", function() {
    var selector = new dom.Selector()
    assert.equal(selector.toString(), selector.clone().toString())
  })
  it("combine", function() {
    var selector = new dom.Selector({
      attribute: "data-test",
      value: "test",
      operator: "="
    })

    var newSelector = selector.combine("HELLO")
    assert.instanceOf(newSelector, dom.Selector)
    assert.notEqual(selector, newSelector)
    assert.equal(newSelector.toString(), '[data-test="test"]HELLO')

    var otherSelector = new dom.Selector({
      attribute: "data-test",
      value: "test",
      operator: "="
    })
    newSelector = selector.combine(otherSelector)
    assert.equal(newSelector.toString(), '[data-test="test"][data-test="test"]')
  })
  it("equal", function() {
    var selector = new dom.Selector({
      attribute: "data-test",
      value: "test",
      operator: "ASD"
    })

    var newSelector = selector.equal("TEST")
    assert.instanceOf(newSelector, dom.Selector)
    assert.notEqual(selector, newSelector)
    assert.equal(newSelector.operator, "=")
    assert.equal(newSelector.value, "TEST")
  })
  it("contains", function() {
    var selector = new dom.Selector({
      attribute: "data-test",
      value: "test",
      operator: "ASD"
    })

    var newSelector = selector.contains("TEST")
    assert.instanceOf(newSelector, dom.Selector)
    assert.notEqual(selector, newSelector)
    assert.equal(newSelector.operator, "~=")
    assert.equal(newSelector.value, "TEST")
  })
  it("prefix", function() {
    var selector = new dom.Selector({
      attribute: "data-test",
      value: "test",
      operator: "ASD"
    })

    var newSelector = selector.prefix("TEST")
    assert.instanceOf(newSelector, dom.Selector)
    assert.notEqual(selector, newSelector)
    assert.equal(newSelector.value, "TEST:test")
    assert.equal(newSelector.prefix("TEST", "/").value, "TEST/TEST:test")
  })
  it("nest", function() {
    var selector = new dom.Selector({
      attribute: "data-test",
      value: "test",
      operator: "ASD"
    })

    var newSelector = selector.nest("TEST")
    assert.instanceOf(newSelector, dom.Selector)
    assert.notEqual(selector, newSelector)
    assert.equal(newSelector.value, "test:TEST")
    assert.equal(newSelector.nest("TEST", "/").value, "test:TEST/TEST")
  })
  it("from", function() {
    var selector = new dom.Selector({})

    var newSelector = selector.from(null)
    assert.instanceOf(newSelector, dom.Selector)
    assert.notEqual(selector, newSelector)
    assert.isNull(newSelector.element)
  })
  it("unwanted parent", function() {
    var el1 = createElement("div", "", "parent")
    var el1child = createElement("div", "", "child")
    el1.appendChild(el1child)
    var el2 = createElement("div", "", "parent")
    var el2child = createElement("div", "", "child")
    el2.appendChild(el2child)

    el1child.appendChild(el2)

    var multiSelector = new dom.Selector({
      attribute: "class",
      value: "child",
      multiple: true
    })

    var singleSelector = new dom.Selector({
      attribute: "class",
      value: "child"
    })
    var unwantedParentSelector = new dom.Selector({
      attribute: "class",
      value: "parent"
    })

    var children2 = singleSelector.from(el2, unwantedParentSelector).find()
    assert.equal(children2, el2child)

    var children1 = multiSelector.from(el1, ".parent").find()
    assert.lengthOf(children1, 1)
    assert.equal(children1[0], el1child)
  })

  test("select", "test", "", {}, function(element) {
    var selector = new dom.Selector({
      attribute: "id",
      value: "test"
    })
    assert.equal(selector.select(document.body), element)
  })

  it("select null", function() {
    var selector = new dom.Selector({
      attribute: "asd",
      value: "qwe"
    })
    assert.isNull(selector.select(document.body))
  })

  test("selectAll", "test", "", {}, function(element) {
    var child1 = element.appendChild(createElement("div", "", "test"))
    var child2 = element.appendChild(createElement("div", "", "test"))
    var selector = new dom.Selector({
      attribute: "class",
      value: "test"
    })
    assert.isArray(selector.selectAll(element))
    assert.lengthOf(selector.selectAll(element), 2)
    assert.equal(selector.selectAll(element)[0], child1)
    assert.equal(selector.selectAll(element)[1], child2)
  })

  it("selectAll empty", function() {
    var selector = new dom.Selector({
      attribute: "asd",
      value: "qwe"
    })
    assert.isArray(selector.selectAll(document.body))
    assert.lengthOf(selector.selectAll(document.body), 0)
  })

  test("node", "test", "", {}, function(element) {
    var selector = new dom.Selector({
      attribute: "id",
      value: "test"
    })
    assert.equal(selector.from(document.body).node(), element)
  })

  test("nodeList", "test", "", {}, function(element) {
    var child1 = element.appendChild(createElement("div", "", "test"))
    var child2 = element.appendChild(createElement("div", "", "test"))
    var selector = new dom.Selector({
      attribute: "class",
      value: "test"
    })
    assert.isArray(selector.from(element).nodeList())
    assert.lengthOf(selector.from(element).nodeList(), 2)
    assert.equal(selector.from(element).nodeList()[0], child1)
    assert.equal(selector.from(element).nodeList()[1], child2)
  })

  test("transformed nodeList", "test", "", {}, function(element) {
    element.appendChild(createElement("div", "", "test"))
    element.appendChild(createElement("div", "", "test"))
    var selector = new dom.Selector({
      attribute: "class",
      value: "test"
    })
    var result = selector.from(element).nodeList(function(element, i) {
      return i
    })
    assert.isArray(result)
    assert.lengthOf(result, 2)
    assert.equal(result[0], 0)
    assert.equal(result[1], 1)
  })

  test("construct", "", "", {}, function(element) {
    var child = element.appendChild(createElement("div", "", "test"))

    function Test(element) {
      this.element = element
    }

    var selector = new dom.Selector({
      Constructor: Test,
      attribute: "class",
      value: "test"
    })
    var result = selector.from(element).construct()
    assert.instanceOf(result, Test)
    assert.equal(result.element, child)
  })

  test("construct null", "", "", {}, function(element) {
    function Test(element) {
      this.element = element
    }

    var selector = new dom.Selector({
      Constructor: Test,
      attribute: "class",
      value: "test"
    })
    var result = selector.from(element).construct()
    assert.isNull(result)
  })

  test("construct multiple", "", "", {}, function(element) {
    var child1 = element.appendChild(createElement("div", "", "test"))
    var child2 = element.appendChild(createElement("div", "", "test"))

    function Test(element) {
      this.element = element
    }

    var selector = new dom.Selector({
      Constructor: Test,
      multiple: true,
      attribute: "class",
      value: "test"
    })
    var result = selector.from(element).construct()
    assert.isArray(result)
    assert.lengthOf(result, 2)
    assert.instanceOf(result[0], Test)
    assert.instanceOf(result[1], Test)
    assert.equal(result[0].element, child1)
    assert.equal(result[1].element, child2)
  })

  test("construct multiple empty", "", "", {}, function(element) {
    function Test(element) {
      this.element = element
    }

    var selector = new dom.Selector({
      Constructor: Test,
      multiple: true,
      attribute: "class",
      value: "test"
    })
    var result = selector.from(element).construct()
    assert.isArray(result)
    assert.lengthOf(result, 0)
  })
})
