var defaults = require("matchbox-util/object/defaults")
var InstanceExtension = require("matchbox-factory/InstanceExtension")
var CacheExtension = require("matchbox-factory/CacheExtension")
var Selector = require("matchbox-dom/Selector")
var Fragment = require("matchbox-dom/Fragment")
var View = require("./View")

var Element = module.exports = View.extend({
  extensions: {
    children: new InstanceExtension(function(element, name, selector){
      selector = new Selector(defaults(selector, {
        attribute: "data-element",
        operator: "~",
        value: name
      })).prefix(element.name)
      selector.element = element.element
      element.children[name] = selector
    }),
    fragments: new CacheExtension(function (prototype, name, fragment) {
      if (!(fragment instanceof Fragment)) {
        return new Fragment(fragment)
      }
      return fragment
    })
  },
  children: {},
  modifiers: {},
  changeLayout: {},
  events: {},
  data: {},
  fragments: {},
  constructor: function Element(element) {
    View.apply(this, arguments)
    Element.initialize(this)
  },
  prototype: {
    name: ""
  }
})
