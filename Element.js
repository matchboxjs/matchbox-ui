var CacheExtension = require("matchbox-factory/CacheExtension")
var Fragment = require("matchbox-dom/Fragment")
var View = require("./View")
var Child = require("./Child")

var Element = module.exports = View.extend({
  extensions: {
    children: new CacheExtension(function(prototype, name, child){
      if (!(child instanceof Child)) {
        child = new Child(child)
      }
      child.attribute = "data-child"
      return child.contains(child.value || name).prefix(prototype.name)
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
    name: "",
    findChild: function (name) {
      var child = this.children[name]
      if (child) {
        return child.from(this.element).find()
      }
      return null
    }
  }
})
