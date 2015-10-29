var inherit = require("matchbox-factory/inherit")
var Selector = require("matchbox-dom/Selector")

module.exports = Child

function Child (child) {
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
}

inherit(Child, Selector)

Child.prototype.clone = function () {
  return new Child(this)
}
