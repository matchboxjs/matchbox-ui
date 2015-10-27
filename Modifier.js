module.exports = Modifier

function Modifier (modifier) {
  this.type = modifier.type
  this.default = modifier.default == null ? null : modifier.default
  this.values = []
  this.value = null
  this.onchange = null
  this.animationDuration = 0
  this.timerId = null
  switch (this.type) {
    case "switch":
      if (modifier.on) {
        this.values.push(modifier.on)
      }
      if (modifier.off) {
        this.values.push(modifier.off)
      }
      break
    case "enum":
      this.values = modifier.values || []
      break
  }
}

Modifier.prototype.reset = function (element, context) {
  if (this.default != null) {
    this.set(this.default, element, context)
  }
}

Modifier.prototype.get = function () {
  return this.value
}

Modifier.prototype.set = function (value, element, context) {
  if (this.timerId) {
    clearTimeout(this.timerId)
    this.timerId = null
  }

  switch (this.type) {
    case "switch":
      value = !!value
      if (this.value === value) {
        break
      }

      var on = this.values[0]
      var off = this.values[1]
      if (value === true) {
        if (off) element.classList.remove(off)
        if (on) element.classList.add(on)
      }
      else {
        if (on) element.classList.remove(on)
        if (off) element.classList.add(off)
      }
      this.value = value
      break
    case "enum":
      if (!!~this.values.indexOf(value)) {
        break
      }

      if (this.value && element.classList.has(this.value)) {
        element.classList.remove(this.value)
      }
      this.value = value
      element.classList.add(this.value)
      break
  }

  if (this.onchange) {
    context = context || element
    var delay = this.animationDuration
    var onchange = this.onchange
    this.timerId = setTimeout(function () {
      onchange.call(context)
    }, delay)
  }
}
