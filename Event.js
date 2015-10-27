var delegate = require("matchbox-dom/delegate")

module.exports = Event

function Event (event, target, capture, once, handler) {
  if (typeof event == "string") {
    this.type = event
    switch (arguments.length) {
      case 2:
        this.handler = target
        break
      case 3:
        this.target = target
        this.handler = capture
        break
      case 4:
        this.target = target
        this.capture = capture
        this.handler = once
        break
      case 5:
        this.target = target
        this.capture = capture
        this.once = once
        this.handler = handler
        break
    }
    this.transform = null
  }
  else {
    event = event || {}
    this.type = event.type
    this.target = event.target
    this.once = !!event.once
    this.capture = !!event.capture
    this.handler = event.handler
    if (event.transform ) this.transform = event.transform
  }
  this.proxy = this.handler
}

Event.prototype.transform = function () {}

Event.prototype.register = function (element, context) {
  if (this.target) {
    this.proxy = delegate({
      element: element,
      event: this.type,
      context: context,
      transform: this.transform
    })
    this.proxy.match(this.target, this.handler)
  }
  else {
    if (this.once) {
      element.addEventListener(this.type, this.handler, this.capture)
    }
    else {
      element.addEventListener(this.type, this.handler, this.capture)
    }
  }
}

Event.prototype.unRegister = function (element) {
  if (this.proxy) {
    element.removeEventListener(this.type, this.proxy, this.capture)
  }
  else {
    element.removeEventListener(this.type, this.handler, this.capture)
  }
}
