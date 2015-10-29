var inherit = require("matchbox-factory/inherit")
var CacheExtension = require("matchbox-factory/CacheExtension")
var Selector = require("matchbox-dom/Selector")
var View = require("./View")
var Region = require("./Region")
var Child = require("./Child")

var Screen = module.exports = View.extend({
  extensions: {
    regions: new CacheExtension(function (screen, name, child) {
      if (!(child instanceof Child)) {
        child = new Child(child)
      }
      child.attribute = "data-region"
      child.Constructor = child.Constructor || Region
      return child.contains(child.value || name)
    })
  },
  regions: {},
  changeLayout: {},
  events: {},
  data: {},
  constructor: function Screen(element) {
    element = element || document.body
    if (!element.matches(this.selector.toString())) {
      element = this.selector.select(element)
    }
    View.call(this, element)
    Screen.initialize(this)
  },
  prototype: {
    selector: new Selector({attribute: "data-screen"}),
    findRegion: function (name) {
      var child = this.regions[name]
      if (child) {
        return child.from(this.element).find()
      }
      return null
    }
  }
})
