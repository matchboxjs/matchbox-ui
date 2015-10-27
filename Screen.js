var defaults = require("matchbox-util/object/defaults")
var inherit = require("matchbox-factory/inherit")
var InstanceExtension = require("matchbox-factory/InstanceExtension")
var Selector = require("matchbox-dom/Selector")
var View = require("./View")
var Region = require("./Region")

var Screen = module.exports = View.extend({
  extensions: {
    regions: new InstanceExtension(function (screen, name, selector) {
      if (typeof selector == "function") {
        selector = {Constructor: selector}
      }
      selector = new Selector(defaults(selector, {
        attribute: "data-region",
        operator: "=",
        value: name,
        Constructor: Region
      }))
      selector.element = screen.element
      screen.regions[name] = selector
    })
  },
  regions: {},
  changeLayout: {},
  events: {},
  data: {},
  constructor: function Screen(element) {
    element = element || document.body
    element = this.selector.select(element)
    View.call(this, element)
    this.regions = {}
    Screen.initialize(this)
  },
  prototype: {
    selector: new Selector({attribute: "data-screen"})
  }
})
