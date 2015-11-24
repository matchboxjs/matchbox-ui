var inherit = require("matchbox-factory/inherit")
var Selector = require("matchbox-dom/Selector")

module.exports = Child

Child.DEFAULT_ATTRIBUTE = "data-child"

function Child (child) {
  child = child || {}
  if (!(this instanceof Child)) {
    return new Child(child)
  }

  switch (typeof child) {
    case "function":
      Selector.call(this, {Constructor: child})
      break
    case "string":
      Selector.call(this, {value: child})
      break
    default:
      Selector.call(this, child)
  }

  this.attribute = this.attribute || Child.DEFAULT_ATTRIBUTE
  this.autoselect = child.autoselect == undefined ? false : child.autoselect
}

inherit(Child, Selector)

Child.prototype.clone = function () {
  return new this.constructor(this)
}
