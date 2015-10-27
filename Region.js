var defaults = require("matchbox-util/object/defaults")
var InstanceExtension = require("matchbox-factory/InstanceExtension")
var Selector = require("matchbox-dom/Selector")
var View = require("./View")

var Region = module.exports = View.extend({
  extensions: {
    children: new InstanceExtension(function(region, name, selector){
      selector = new Selector(defaults(selector, {
        attribute: "data-element",
        operator: "~",
        value: name
      }))
      selector.element = region.element
      region.children[name] = selector
    })
  },
  children: {},
  layouts: {},
  events: {},
  data: {
    visible: false,
    focused: false
  },
  constructor: function Region(element) {
    View.call(this, element)
    Region.initialize(this)
  },
  prototype: {
    name: ""
  }
})
