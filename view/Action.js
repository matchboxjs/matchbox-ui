var inherit = require("matchbox-factory/inherit")
var include = require("matchbox-factory/include")
var Selector = require("matchbox-dom/Selector")
var Event = require("./Event")
var Child = require("./Child")

module.exports = Action

Action.DEFAULT_ATTRIBUTE = "data-action"

function Action (event, target, handler) {
  if (!(this instanceof Action)) {
    switch (arguments.length) {
      case 1:
        return new Action(event)
      case 2:
        return new Action(event, target)
      case 3:
        return new Action(event, target, handler)
    }
  }
  switch (arguments.length) {
    case 1:
      this.event = new Event(event)
      break
    case 2:
      this.event = new Event(event, target)
      break
    case 3:
      this.event = new Event(event, target, handler)
      break
  }
  this.selector = null
}

Action.prototype.initialize = function (action, viewName) {
  var selector = this.selector = new Selector({attribute: Action.DEFAULT_ATTRIBUTE, value: action})

  if (!Array.isArray(this.event.target)) {
    this.event.target = []
  }

  this.event.target = this.event.target.map(function (selector) {
    if (!(typeof selector == "string")) {
      return selector
    }

    if (!viewName || selector[0] != Selector.DEFAULT_NEST_SEPARATOR) {
      return new Child(selector)
    }

    selector = selector.substr(1)
    return new Child(selector).prefix(viewName)
  })

  if (viewName) {
    this.event.target.push(selector.prefix(viewName))
  }
  else {
    this.event.target.push(selector)
  }

  this.event.transform = function (view, delegateSelector, delegateElement) {
    var child
    if (delegateSelector instanceof Child) {
      child = view.getChildView(delegateSelector.name, delegateElement)
    }

    return child || delegateElement
  }
}

Action.prototype.registerEvent = function (element, context) {
  this.event.register(element, context)
}

Action.prototype.unRegisterEvent = function (element) {
  this.event.unRegister(element)
}
