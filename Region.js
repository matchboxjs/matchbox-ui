var CacheExtension = require("matchbox-factory/CacheExtension")
var View = require("./View")
var Child = require("./Child")

var Region = module.exports = View.extend({
  extensions: {
    elements: new CacheExtension(function(prototype, name, child){
      if (!(child instanceof Child)) {
        child = new Child(child)
      }
      child.attribute = "data-element"
      return child.contains(child.value || name)
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
    findElement: function (name) {
      var child = this.elements[name]
      if (child) {
        return child.from(this.element).find()
      }
      return null
    }
  }
})
