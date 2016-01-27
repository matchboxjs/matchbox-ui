(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.matchboxUi = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ui = module.exports = {}

ui.data = require("matchbox-dom/data")
ui.View = require("./view/View")
ui.Child = require("./view/Child")
ui.Event = require("./view/EventInit")
ui.Action = require("./view/ActionInit")
ui.Modifier = require("./view/ModifierInit")
ui.SwitchModifier = require("./view/SwitchModifier")
ui.EnumModifier = require("./view/EnumModifier")

},{"./view/ActionInit":35,"./view/Child":36,"./view/EnumModifier":37,"./view/EventInit":39,"./view/ModifierInit":41,"./view/SwitchModifier":42,"./view/View":43,"matchbox-dom/data":21}],2:[function(require,module,exports){
/**
 * Apply one or more functional mixins to a constructor's prototype.
 *
 * @param {Function} Constructor
 * @param {Function|Function[]} mixin
 *
 * @return {Function} Constructor
 * */
module.exports = function augment(Constructor, mixin) {
  if (Array.isArray(mixin)) {
    mixin.forEach(function(func) {
      if (typeof func == "function") {
        func.call(Constructor.prototype)
      }
    })
  }
  else if (typeof mixin == "function") {
    mixin.call(Constructor.prototype)
  }

  return Constructor
}

},{}],3:[function(require,module,exports){
/**
 * Extend a single constructor's prototype with a prototype object
 * copying methods with the same property descriptor.
 *
 * @param {Function} Constructor
 * @param {Object} prototype
 *
 * @return {Function} Constructor
 * */
module.exports = function extend(Constructor, prototype) {
  Object.getOwnPropertyNames(prototype).forEach(function(name) {
    if (name !== "constructor") {
      var descriptor = Object.getOwnPropertyDescriptor(prototype, name)
      Object.defineProperty(Constructor.prototype, name, descriptor)
    }
  })

  return Constructor
}

},{}],4:[function(require,module,exports){
var extend = require("./extend")

/**
 * Extends a constructor's prototype with one or more constructor or prototype object
 *
 * @param {Function} Constructor
 * @param {Function|Object} Other
 *
 * @return {Function} Constructor
 * */
module.exports = function include(Constructor, Other) {
  if (Array.isArray(Other)) {
    Other.forEach(function(Other) {
      if (typeof Other == "function") {
        extend(Constructor, Other.prototype)
      }
      else if (typeof Other == "object") {
        extend(Constructor, Other)
      }
    })
  }
  else {
    if (typeof Other == "function") {
      extend(Constructor, Other.prototype)
    }
    else if (typeof Other == "object") {
      extend(Constructor, Other)
    }
  }

  return Constructor
}

},{"./extend":3}],5:[function(require,module,exports){
/**
 * Inherit from another constructor
 *
 * @param {Function} Constructor
 * @param {Function} Base
 *
 * @return {Function} Class
 * */
module.exports = function inherit(Constructor, Base) {
  Constructor.prototype = Object.create(Base.prototype)
  Constructor.prototype.constructor = Constructor

  return Constructor
}

},{}],6:[function(require,module,exports){
module.exports = Descriptor

var propWritable = "_writable"
var propEnumerable = "_enumerable"
var propConfigurable = "_configurable"

function Descriptor(writable, enumerable, configurable) {
  this.value(this, propWritable, writable || false)
  this.value(this, propEnumerable, enumerable || false)
  this.value(this, propConfigurable, configurable || false)

  this.getter(this, "w", function() {
    return this.writable
  })
  this.getter(this, "writable", function() {
    return new Descriptor(true, enumerable, configurable)
  })

  this.getter(this, "e", function() {
    return this.enumerable
  })
  this.getter(this, "enumerable", function() {
    return new Descriptor(writable, true, configurable)
  })

  this.getter(this, "c", function() {
    return this.configurable
  })
  this.getter(this, "configurable", function() {
    return new Descriptor(writable, enumerable, true)
  })
}

Descriptor.prototype = {
  accessor: function(obj, name, getter, setter) {
    Object.defineProperty(obj, name, {
      enumerable: this[propEnumerable],
      configurable: this[propConfigurable],
      get: getter,
      set: setter
    })
    return this
  },
  getter: function(obj, name, fn) {
    Object.defineProperty(obj, name, {
      enumerable: this[propEnumerable],
      configurable: this[propConfigurable],
      get: fn
    })
    return this
  },
  setter: function(obj, name, fn) {
    Object.defineProperty(obj, name, {
      enumerable: this[propEnumerable],
      configurable: this[propConfigurable],
      set: fn
    })
    return this
  },
  value: function(obj, name, value) {
    Object.defineProperty(obj, name, {
      writable: this[propWritable],
      enumerable: this[propEnumerable],
      configurable: this[propConfigurable],
      value: value
    })
    return this
  },
  method: function(obj, name, fn) {
    Object.defineProperty(obj, name, {
      writable: this[propWritable],
      enumerable: false,
      configurable: this[propConfigurable],
      value: fn
    })
    return this
  },
  property: function(obj, name, value) {
    Object.defineProperty(obj, name, {
      writable: this[propWritable],
      enumerable: false,
      configurable: this[propConfigurable],
      value: value
    })
    return this
  },
  constant: function(obj, name, value) {
    Object.defineProperty(obj, name, {
      writable: false,
      enumerable: false,
      configurable: false,
      value: value
    })
    return this
  }
}

},{}],7:[function(require,module,exports){
var extend = require("./extend")

/**
 * Shallow copy an object
 *
 * @param {Object} obj
 *
 * @return {Object} a copy of the object
 * */
module.exports = function(obj) {
  return extend({}, obj)
}

},{"./extend":10}],8:[function(require,module,exports){
var copy = require("./copy")
/**
 * Return a new object with extended keys to contain default values.
 *
 * @param {Object} options
 * @param {Object} defaultValues
 *
 * @return {Object} merged object
 * */
module.exports = function defaults(options, defaultValues) {
  if (!options) {
    return copy(defaultValues)
  }

  var obj = copy(options)

  for (var prop in defaultValues) {
    if (defaultValues.hasOwnProperty(prop) && !options.hasOwnProperty(prop)) {
      obj[prop] = defaultValues[prop]
    }
  }

  return obj
}

},{"./copy":7}],9:[function(require,module,exports){
var Descriptor = require("./Descriptor")

/**
 * Define a property with a descriptor
 * */
module.exports = new Descriptor()

},{"./Descriptor":6}],10:[function(require,module,exports){
/**
 * Extend an object with another
 *
 * @param {Object} obj
 * @param {Object} extension
 *
 * @return {Object} obj
 * */
module.exports = function extend(obj, extension) {
  for (var name in extension) {
    if (extension.hasOwnProperty(name)) obj[name] = extension[name]
  }
  return obj
}

},{}],11:[function(require,module,exports){
/**
 * Safely iterate on an object
 *
 * @param {Object} obj
 * @param {Function} callback(String key, * value, Object obj)
 *
 * @return {Object} obj
 * */
module.exports = function(obj, callback) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      callback(prop, obj[prop], obj)
    }
  }
  return obj
}

},{}],12:[function(require,module,exports){
var extend = require("./extend")

/**
 * Merge two objects and return a new object.
 *
 * @param {Object} base
 * @param {Object} extension
 *
 * @return {Object} base
 * */
module.exports = function(base, extension) {
  return extend(extend({}, base), extension)
}

},{"./extend":10}],13:[function(require,module,exports){
module.exports = DomData

function DomData (name, defaultValue, onChange) {
  this.name = name
  this.onChange = onChange || null
  this.default = defaultValue == null ? null : defaultValue
}

DomData.prototype.type = ""

DomData.prototype.attributeName = function () {
  return "data-"+this.name
}
DomData.prototype.checkType = function (value) {
  return value != null
}

DomData.prototype.parse = function (value) {
  return value
}

DomData.prototype.stringify = function (value) {
  return ""+value
}

DomData.prototype.get = function (element) {
  var attributeName = this.attributeName()
  if (element.hasAttribute(attributeName)) {
    return this.parse(element.getAttribute(attributeName))
  }

  return this.default
}

DomData.prototype.set = function (element, value, context, silent) {
  if (!this.checkType(value)) {
    throw new TypeError("Can't set DomData "+this.type+" to '"+value+"'")
  }

  var attributeName = this.attributeName()

  var hasValue = element.hasAttribute(attributeName)
  var newStringValue = this.stringify(value)
  var prevStringValue = hasValue ? element.getAttribute(attributeName) : null

  if (newStringValue === prevStringValue) {
    return
  }

  element.setAttribute(attributeName, newStringValue)

  if (!silent) {
    var onChange = this.onChange
    if (onChange) {
      var previousValue = hasValue ? this.parse(prevStringValue) : null
      onChange.call(context, previousValue, value)
    }
  }
}

DomData.prototype.has = function (element) {
  return element.hasAttribute(this.attributeName())
}

DomData.prototype.remove = function (element, context, silent) {
  var attributeName = this.attributeName()
  if (!element.hasAttribute(attributeName)) {
    return
  }

  var previousValue = element.hasAttribute(attributeName)
      ? this.parse(element.getAttribute(attributeName))
      : null

  element.removeAttribute(attributeName)

  if (!silent) {
    var onChange = this.onChange
    if (onChange) {
      onChange.call(context, previousValue, null)
    }
  }
}


},{}],14:[function(require,module,exports){
module.exports = Fragment

function Fragment (fragment) {
  fragment = fragment || {}
  this.html = fragment.html || ""
  this.first = fragment.first == undefined || !!fragment.first
  this.timeout = fragment.timeout || 2000
}

Fragment.prototype.create = function (html) {
  var temp = document.createElement('div')

  temp.innerHTML = html || this.html

  if (this.first === undefined || this.first) {
    return temp.children[0]
  }

  var fragment = document.createDocumentFragment()
  while (temp.childNodes.length) {
    fragment.appendChild(temp.firstChild)
  }

  return fragment;
}

Fragment.prototype.compile = function (html, options, cb) {
  setTimeout(function () {
    cb(null, html)
  }, 4)
}

Fragment.prototype.render = function (context, options) {
  var fragment = this
  context = context || {}

  return new Promise(function (resolve, reject) {
    var resolved = false
    var id = setTimeout(function () {
      reject(new Error("Render timed out"))
    }, fragment.timeout)

    try {
      fragment.compile(context, options, function (err, rendered) {
        clearTimeout(id)
        if (resolved) return

        if (err) {
          reject(err)
        }
        else {
          resolve(fragment.create(rendered))
        }
      })
    }
    catch (e) {
      reject(e)
    }
  })
}

},{}],15:[function(require,module,exports){
module.exports = Selector

Selector.DEFAULT_NEST_SEPARATOR = ":"

function Selector (selector) {
  selector = selector || {}
  this.attribute = selector.attribute || ""
  this.value = selector.value || null
  this.operator = selector.operator || "="
  this.extra = selector.extra || ""

  this.element = selector.element || null
  this.unwantedParentSelector = selector.unwantedParentSelector || null

  this.Constructor = selector.Constructor || null
  this.instantiate = selector.instantiate || null
  this.multiple = selector.multiple != null ? !!selector.multiple : false

  this.matcher = selector.matcher || null
}

function parentFilter (unMatchSelector, realParent) {
  return function isUnwantedChild(el) {
    var parent = el.parentNode
    while (parent && parent != realParent) {
      if (parent.matches(unMatchSelector)) {
        return false
      }
      parent = parent.parentNode
    }
    return true
  }
}

Selector.prototype.clone = function () {
  return new Selector(this)
}

Selector.prototype.combine = function (selector) {
  var s = this.clone()
  s.extra += selector.toString()
  return s
}

Selector.prototype.equal = function (value) {
  var s = this.clone()
  s.operator = "="
  s.value = value
  return s
}

Selector.prototype.contains = function (value) {
  var s = this.clone()
  s.operator = "~="
  s.value = value
  return s
}

Selector.prototype.prefix = function (pre, separator) {
  var s = this.clone()
  var sep = s.value ? separator || Selector.DEFAULT_NEST_SEPARATOR : ""
  s.value = pre + sep + s.value
  return s
}

Selector.prototype.nest = function (post, separator) {
  var s = this.clone()
  var sep = s.value ? separator || Selector.DEFAULT_NEST_SEPARATOR : ""
  s.value += sep + post
  return s
}

Selector.prototype.from = function (element, except) {
  var s = this.clone()
  s.element = element
  if (except) {
    s.unwantedParentSelector = except.toString()
  }
  return s
}

Selector.prototype.select = function (element, transform) {
  var result = element.querySelector(this.toString())
  if (result && this.unwantedParentSelector && this.element) {
    var isWantedChild = parentFilter(this.unwantedParentSelector, this.element)
    if (!isWantedChild(result)) {
      return null
    }
  }
  return result
      ? transform ? transform(result) : result
      : null
}

Selector.prototype.selectAll = function (element, transform) {
  var result = element.querySelectorAll(this.toString())
  if (this.unwantedParentSelector && this.element) {
    result = [].filter.call(result, parentFilter(this.unwantedParentSelector, this.element))
  }
  return transform ? [].map.call(result, transform) : [].slice.call(result)
}

Selector.prototype.node = function (transform) {
  return this.select(this.element, transform)
}

Selector.prototype.nodeList = function (transform) {
  return this.selectAll(this.element, transform)
}

Selector.prototype.construct = function () {
  var Constructor = this.Constructor
  var instantiate = this.instantiate || function (element) {
    return new Constructor(element)
  }
  if (this.multiple) {
    return this.nodeList().map(instantiate)
  }
  else {
    return this.node(instantiate)
  }
}

Selector.prototype.find = function () {
  if (this.Constructor || this.instantiate) {
    return this.construct()
  }
  if (this.multiple) {
    return this.nodeList()
  }
  else {
    return this.node()
  }
}

Selector.prototype.toString = function () {
  var string = ""
  var value = this.value
  var attribute = this.attribute
  var extra = this.extra || ""

  switch (attribute) {
    case "id":
        string = "#" + value
      break
    case "class":
      string = "." + value
      break
    case "":
      string = value || ""
      break
    default:
      value = value === "" || value === true || value === false || value == null
        ? ""
        : '"' + value + '"'
      var operator = value ? this.operator || "=" : ""
      string = "[" + attribute + operator + value + "]"
  }

  string += extra

  return string
}

},{}],16:[function(require,module,exports){
var inherit = require("matchbox-factory/inherit")
var Data = require("../Data")

module.exports = BooleanData

function BooleanData (name, defaultValue, onChange) {
  Data.call(this, name, defaultValue, onChange)
}

inherit(BooleanData, Data)

BooleanData.prototype.type = "Boolean"

BooleanData.prototype.checkType = function (value) {
  return typeof value == "boolean"
}

BooleanData.prototype.parse = function (value) {
  return value === "true"
}

BooleanData.prototype.stringify = function (value) {
  return value ? "true" : "false"
}

},{"../Data":13,"matchbox-factory/inherit":23}],17:[function(require,module,exports){
var inherit = require("matchbox-factory/inherit")
var Data = require("../Data")

module.exports = FloatData

function FloatData (name, defaultValue, onChange) {
  Data.call(this, name, defaultValue, onChange)
}

inherit(FloatData, Data)

FloatData.prototype.type = "float"

FloatData.prototype.checkType = function (value) {
  return typeof value == "number"
}

FloatData.prototype.parse = function (value) {
  return parseFloat(value)
}

FloatData.prototype.stringify = function (value) {
  return ""+value
}

},{"../Data":13,"matchbox-factory/inherit":23}],18:[function(require,module,exports){
var inherit = require("matchbox-factory/inherit")
var Data = require("../Data")

module.exports = JSONData

function JSONData (name, defaultValue, onChange) {
  Data.call(this, name, defaultValue, onChange)
}

inherit(JSONData, Data)

JSONData.prototype.type = "json"

JSONData.prototype.checkType = function (value) {
  return value != null
}

JSONData.prototype.parse = function (value) {
  return JSON.parse(value)
}

JSONData.prototype.stringify = function (value) {
  return JSON.stringify(value)
}

},{"../Data":13,"matchbox-factory/inherit":23}],19:[function(require,module,exports){
var inherit = require("matchbox-factory/inherit")
var Data = require("../Data")

module.exports = NumberData

function NumberData (name, defaultValue, onChange) {
  Data.call(this, name, defaultValue, onChange)
}

inherit(NumberData, Data)

NumberData.prototype.type = "number"

NumberData.prototype.checkType = function (value) {
  return typeof value == "number"
}

NumberData.prototype.parse = function (value) {
  return parseInt(value, 10)
}

NumberData.prototype.stringify = function (value) {
  return ""+value
}

},{"../Data":13,"matchbox-factory/inherit":23}],20:[function(require,module,exports){
var inherit = require("matchbox-factory/inherit")
var Data = require("../Data")

module.exports = StringData

function StringData (name, defaultValue, onChange) {
  Data.call(this, name, defaultValue, onChange)
}

inherit(StringData, Data)

StringData.prototype.type = "string"

StringData.prototype.checkType = function (value) {
  return typeof value == "string"
}

StringData.prototype.parse = function (value) {
  return value ? ""+value : ""
}

StringData.prototype.stringify = function (value) {
  return value ? ""+value : ""
}

},{"../Data":13,"matchbox-factory/inherit":23}],21:[function(require,module,exports){
var data = module.exports = {}

data.Boolean = require("./BooleanData")
data.String = require("./StringData")
data.Number = require("./NumberData")
data.Float = require("./FloatData")
data.JSON = require("./JSONData")

data.create = function (name, value, onChange) {
  if (value == null) {
    return null
  }

  var type = typeof value

  switch(type) {
    case "boolean":
      return new data.Boolean(name, value, onChange)
    case "string":
      return new data.String(name, value, onChange)
    case "number":
      // note: it fails for 1.0
      if (value === +value && value !== (value | 0)) {
        return new data.Float(name, value, onChange)
      }
      return new data.Number(name, value, onChange)
    default:
      return new data.JSON(name, value, onChange)
  }
}

},{"./BooleanData":16,"./FloatData":17,"./JSONData":18,"./NumberData":19,"./StringData":20}],22:[function(require,module,exports){
var Selector = require("../Selector")

/**
 * Registers an event listener on an element
 * and returns a delegator.
 * A delegated event runs matches to find an event target,
 * then executes the handler paired with the matcher.
 * Matchers can check if an event target matches a given selector,
 * or see if an of its parents do.
 * */
module.exports = delegate

function delegate( options ){
  var element = options.element
    , event = options.event
    , capture = !!options.capture || false
    , context = options.context || element
    , transform = options.transform || null

  if( !element ){
    console.log("Can't delegate undefined element")
    return null
  }
  if( !event ){
    console.log("Can't delegate undefined event")
    return null
  }

  var handler = createHandler(context, transform)
  element.addEventListener(event, handler, capture)

  return handler
}

/**
 * Returns a delegator that can be used as an event listener.
 * The delegator has static methods which can be used to register handlers.
 * */
function createHandler( context, transform ){
  var matchers = []

  function delegatedHandler( e ){
    var l = matchers.length
    if( !l ){
      return true
    }

    var el = this
        , i = -1
        , handler
        , selector
        , delegateElement
        , stopPropagation
        , args

    while( ++i < l ){
      args = matchers[i]
      handler = args[0]
      selector = args[1]

      delegateElement = matchCapturePath(selector, el, e, transform, context)
      if( delegateElement && delegateElement.length ) {
        stopPropagation = false === handler.apply(context, [e].concat(delegateElement))
        if( stopPropagation ) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Registers a handler with a target finder logic
   * */
  delegatedHandler.match = function( selector, handler ){
    matchers.push([handler, selector])
    return delegatedHandler
  }

  return delegatedHandler
}

function matchCapturePath( selector, el, e, transform, context ){
  var delegateElements = []
  var delegateElement = null
  if( Array.isArray(selector) ){
    var i = -1
    var l = selector.length
    while( ++i < l ){
      delegateElement = findParent(selector[i], el, e)
      if( !delegateElement ) return null
      if (typeof transform == "function") {
        delegateElement = transform(context, selector[i], delegateElement)
      }
      delegateElements.push(delegateElement)
    }
  }
  else {
    delegateElement = findParent(selector, el, e)
    if( !delegateElement ) return null
    if (typeof transform == "function") {
      delegateElement = transform(context, selector, delegateElement)
    }
    delegateElements.push(delegateElement)
  }
  return delegateElements
}

/**
 * Check if the target or any of its parent matches a selector
 * */
function findParent( selector, el, e ){
  var target = e.target
  if (selector instanceof Selector) {
    selector = selector.toString()
  }
  switch( typeof selector ){
    case "string":
      while( target && target != el ){
        if( target.matches && target.matches(selector) ) return target
        target = target.parentNode
      }
      break
    case "function":
      while( target && target != el ){
        if( selector.call(el, target) ) return target
        target = target.parentNode
      }
      break
    default:
      return null
  }
  return null
}

},{"../Selector":15}],23:[function(require,module,exports){
module.exports = function inherit (Class, Base) {
  Class.prototype = Object.create(Base.prototype)
  Class.prototype.constructor = Class

  return Class
}

},{}],24:[function(require,module,exports){
var Factory = require("./src/Factory")

module.exports = factory

factory.CacheExtension = require("./src/CacheExtension")
factory.InstanceExtension = require("./src/InstanceExtension")
factory.PrototypeExtension = require("./src/PrototypeExtension")

function factory( blueprint ){
  return new Factory(blueprint).assemble()
}

},{"./src/CacheExtension":26,"./src/Factory":28,"./src/InstanceExtension":29,"./src/PrototypeExtension":30}],25:[function(require,module,exports){
var merge = require("backyard/object/merge")
var forIn = require("backyard/object/in")

var Extension = require("./Extension")

module.exports = Blueprint

function Blueprint(blocks, parent) {
  var blueprint = this

  this.blocks = merge(blocks)
  this.parent = parent

  this.localExtensions = this.get("extensions", {})

  forIn(this.localExtensions, function(name, extension) {
    extension = extension instanceof Extension
        ? extension
        : new Extension(extension)
    blueprint.localExtensions[name] = extension
    extension.name = name
  })

  this.globalExtensions = this.localExtensions

  if (parent) {
    this.globalExtensions = merge(parent.globalExtensions, this.localExtensions)
    forIn(this.globalExtensions, function(name, extension) {
      if (extension.inherit) {
        blueprint.blocks[name] = merge(parent.get(name), blueprint.get(name))
      }
    })
  }
}

Blueprint.prototype.buildPrototype = function(prototype, top) {
  this.build("prototype", this.globalExtensions, top, function(name, extension, block) {
    if (extension.loop) {
      forIn(block, function(name, value) {
        extension.initialize(prototype, name, value)
      })
    }
    else {
      extension.initialize(prototype, name, block)
    }
  })
}

Blueprint.prototype.buildCache = function(prototype, top) {
  this.build("cache", this.globalExtensions, top, function(name, extension, block) {
    if (!prototype.hasOwnProperty(name)) {
      prototype[name] = {}
    }

    var cache = prototype[name]
    var initialize = extension.initialize

    if (extension.loop) {
      forIn(block, function(name, value) {
        cache[name] = initialize
            ? initialize(prototype, name, value)
            : value
      })
    }
    else {
      cache[name] = initialize
          ? initialize(prototype, name, block)
          : block
    }
  })
}

Blueprint.prototype.buildInstance = function(instance, top) {
  this.build("instance", this.localExtensions, top, function(name, extension, block) {
    if (extension.loop) {
      forIn(block, function(name, value) {
        extension.initialize(instance, name, value)
      })
    }
    else {
      extension.initialize(instance, name, block)
    }
  })
}

Blueprint.prototype.build = function(type, extensions, top, build) {
  var blueprint = top || this
  forIn(extensions, function(name, extension) {
    if (extension.type != type) return
    var block = blueprint.get(name)
    if (!block) return

    build(name, extension, block)
  })
}

Blueprint.prototype.digest = function(name, fn, loop) {
  if (this.has(name)) {
    var block = this.get(name)
    if (loop) {
      forIn(block, fn)
    }
    else {
      fn.call(this, block)
    }
  }
}

Blueprint.prototype.has = function(name) {
  return this.blocks.hasOwnProperty(name) && this.blocks[name] != null
}

Blueprint.prototype.get = function(name, defaultValue) {
  if (this.has(name)) {
    return this.blocks[name]
  }
  return defaultValue
}

},{"./Extension":27,"backyard/object/in":11,"backyard/object/merge":12}],26:[function(require,module,exports){
var extend = require("backyard/object/extend")
var defaults = require("backyard/object/defaults")
var inherit = require("backyard/function/inherit")

var Extension = require("./Extension")

module.exports = CacheExtension

function CacheExtension(options, initialize) {
  if (!initialize) {
    initialize = options
    options = {}
  }
  options = defaults(options, {
    loop: true
  })
  extend(options, {
    type: "cache",
    inherit: true,
    initialize: initialize
  })
  Extension.call(this, options)
}

inherit(CacheExtension, Extension)

},{"./Extension":27,"backyard/function/inherit":5,"backyard/object/defaults":8,"backyard/object/extend":10}],27:[function(require,module,exports){
module.exports = Extension

function Extension(extension) {
  extension = extension || {}
  this.name = ""
  this.type = extension.type || "instance"
  this.inherit = extension.inherit || false
  this.initialize = extension.initialize || null
  this.loop = extension.loop == null ? true : extension.loop
}

},{}],28:[function(require,module,exports){
var define = require("backyard/object/define")
var extendObject = require("backyard/object/extend")
var extendPrototype = require("backyard/function/extend")
var augment = require("backyard/function/augment")
var include = require("backyard/function/include")
var inherit = require("backyard/function/inherit")

var Blueprint = require("./Blueprint")

module.exports = Factory

function Factory(blueprint, parent) {
  var factory = this

  if (!(blueprint instanceof Blueprint)) {
    blueprint = new Blueprint(blueprint, parent ? parent.blueprint : null)
  }

  this.blueprint = blueprint
  this.parent = parent || null
  this.ancestors = parent ? parent.ancestors.concat([parent]) : []
  this.root = this.ancestors[0] || null
  this.Super = blueprint.get("inherit", null)
  this.Constructor = blueprint.get("constructor", function() {
    if (factory.Super) {
      factory.Super.apply(this, arguments)
    }
    this.constructor.initialize(this)
  })
  this.Constructor.extend = function(superBlueprint) {
    superBlueprint = superBlueprint || {}
    superBlueprint["inherit"] = factory.Constructor
    var superFactory = new Factory(superBlueprint, factory)
    return superFactory.assemble()
  }

  this.industry.push(this)
}

Factory.prototype.assemble = function() {
  var blueprint = this.blueprint
  var Constructor = this.Constructor

  Constructor.Super = this.Super
  Constructor.blueprint = blueprint

  this.digest()

  blueprint.buildPrototype(Constructor.prototype, blueprint)
  blueprint.buildCache(Constructor.prototype, blueprint)

  Constructor.initialize = function(instance) {
    var top = instance.constructor.blueprint
    blueprint.buildInstance(instance, top)
  }

  return Constructor
}

Factory.prototype.digest = function() {
  var blueprint = this.blueprint
  var Constructor = this.Constructor
  var proto = Constructor.prototype

  blueprint.digest("inherit", function(Super) {
    inherit(Constructor, Super)
  })
  blueprint.digest("include", function(includes) {
    include(Constructor, includes)
  })
  blueprint.digest("augment", function(augments) {
    augment(Constructor, augments)
  })
  blueprint.digest("prototype", function(prototype) {
    extendPrototype(Constructor, prototype)
  })
  if (blueprint.parent) {
    extendObject(Constructor, blueprint.parent.get("static"))
  }
  blueprint.digest("static", function(methods) {
    extendObject(Constructor, methods)
  })
  blueprint.digest("accessor", function(name, access) {
    if (!access) return
    if (typeof access == "function") {
      define.getter(proto, name, access)
    }
    else if (typeof access["get"] == "function" && typeof access["set"] == "function") {
      define.accessor(proto, name, access["get"], access["set"])
    }
    else if (typeof access["get"] == "function") {
      define.getter(proto, name, access["get"])
    }
    else if (typeof access["set"] == "function") {
      define.getter(proto, name, access["set"])
    }
  }, true)
  //blueprint.digest("include", function (includes) {
  //  if (!Array.isArray(includes)) {
  //    includes = [includes]
  //  }
  //  includes.forEach(function (include) {
  //    var foreign = factory.findFactory(include)
  //    if (foreign) {
  //      foreign.blueprint.build("prototype", Constructor.prototype, blueprint)
  //    }
  //  })
  //})
}

Factory.prototype.industry = []

//Factory.prototype.findFactory = function(Constructor) {
//  var ret = null
//  this.industry.some(function(factory) {
//    return factory.Constructor === Constructor && (ret = factory)
//  })
//  return ret
//}

},{"./Blueprint":25,"backyard/function/augment":2,"backyard/function/extend":3,"backyard/function/include":4,"backyard/function/inherit":5,"backyard/object/define":9,"backyard/object/extend":10}],29:[function(require,module,exports){
var extend = require("backyard/object/extend")
var defaults = require("backyard/object/defaults")
var inherit = require("backyard/function/inherit")

var Extension = require("./Extension")

module.exports = InstanceExtension

function InstanceExtension(options, initialize) {
  if (!initialize) {
    initialize = options
    options = {}
  }
  options = defaults(options, {
    loop: true
  })
  extend(options, {
    type: "instance",
    inherit: true,
    initialize: initialize
  })
  Extension.call(this, options)
}

inherit(InstanceExtension, Extension)

},{"./Extension":27,"backyard/function/inherit":5,"backyard/object/defaults":8,"backyard/object/extend":10}],30:[function(require,module,exports){
var extend = require("backyard/object/extend")
var defaults = require("backyard/object/defaults")
var inherit = require("backyard/function/inherit")

var Extension = require("./Extension")

module.exports = PrototypeExtension

function PrototypeExtension(options, initialize) {
  if (!initialize) {
    initialize = options
    options = {}
  }
  options = defaults(options, {
    loop: true
  })
  extend(options, {
    type: "prototype",
    inherit: false,
    initialize: initialize
  })
  Extension.call(this, options)
}

inherit(PrototypeExtension, Extension)

},{"./Extension":27,"backyard/function/inherit":5,"backyard/object/defaults":8,"backyard/object/extend":10}],31:[function(require,module,exports){
module.exports = Channel

/**
 * Create a channel
 *
 * @extends Array
 * @constructor Channel
 * @param {String} name
 * */
function Channel(name) {
  this.name = name || ""
}

Channel.prototype = []
Channel.prototype.constructor = Channel

/**
 * Invoke listeners with the given arguments.
 * Listeners are called in the order they were registered.
 * If a listener returns anything it breaks the loop and returns that value.
 *
 * @alias broadcast
 * @return {boolean|*}
 * */
Channel.prototype.publish = function() {
  var listeners = this.slice()
  var l = listeners.length
  if (!l) {
    return false
  }

  var err = null
  var i = -1
  var listener

  while (++i < l) {
    listener = listeners[i]
    if (listener.proxy) listener = listener.proxy
    err = listener.apply(null, arguments)
    if (err != null) return err
  }

  return false
}
Channel.prototype.broadcast = Channel.prototype.publish

/**
 * Add a listener to this channel.
 *
 * @param {Function} listener
 * @return {Channel} this
 * */
Channel.prototype.subscribe = function(listener) {
  if (typeof listener != "function") {
    console.warn("Listener is not a function", listener)
    return this
  }

  if (!this.isSubscribed(listener)) {
    this.push(listener)
  }

  return this
}

/**
 * Remove a listener from the channel
 *
 * @param {Function} listener
 * @return {Channel} this
 * */
Channel.prototype.unsubscribe = function(listener) {
  var i = this.indexOf(listener)
  if (~i) this.splice(i, 1)
  return this
}

/**
 * Register a listener that will be called only once.
 *
 * @param {Function} listener
 * @return {Channel} this
 * */
Channel.prototype.peek = function(listener) {
  var channel = this

  // piggyback on the listener
  listener.proxy = function proxy() {
    var ret = listener.apply(null, arguments)
    channel.unsubscribe(listener)
    return ret
  }
  this.subscribe(listener)

  return this
}

/**
 * Check if a function is registered as a listener on the channel.
 *
 * @param {Function} listener
 * @return {boolean}
 * */
Channel.prototype.isSubscribed = function(listener) {
  return !!(listener && ~this.indexOf(listener))
}

/**
 * Returns how many listeners are registered on the channel.
 *
 * @return {boolean}
 * */
Channel.prototype.hasSubscribers = function() {
  return this.length > 0
}

/**
 * Clears all listeners from the channel.
 *
 * @return {Channel} this
 * */
Channel.prototype.empty = function() {
  this.splice(0)
  return this
}

},{}],32:[function(require,module,exports){
var Channel = require("./Channel")

module.exports = Radio

/**
 * @constructor Radio
 * @member {Array} channels
 * */
function Radio() {
  this.channels = []
}

/**
 * Create a channel if it doesn't exist already
 * and return the channel.
 *
 * @param {String} channel
 * @return {Channel}
 * */
Radio.prototype.channel = function(channel) {
  return this.channels[channel]
      || (this.channels[channel] = new Channel(channel))
}

/**
 * Check if a channel exists.
 *
 * @param {Channel|String} channel
 * @return {boolean}
 * */
Radio.prototype.channelExists = function(channel) {
  return !!channel && (typeof channel == "string"
          ? this.channels.hasOwnProperty(channel)
          : this.channels.hasOwnProperty(channel.name))
}

/**
 * Delete a channel.
 *
 * @param {Channel|String} channel
 * @return {boolean}
 * */
Radio.prototype.deleteChannel = function(channel) {
  if (channel instanceof Channel) {
    return delete this.channels[channel.name]
  }
  return delete this.channels[channel]
}

/**
 * Check if a channel has any subscribers.
 * If the channel doesn't exists it's `false`.
 *
 * @param {Channel|String} channel
 * @return {boolean}
 * */
Radio.prototype.hasSubscribers = function(channel) {
  return this.channelExists(channel) && this.channel(channel).hasSubscribers()
}

/**
 * Check if a listener is subscribed to a channel.
 * If the channel doesn't exists it's `false`.
 *
 * @param {Channel|String} channel
 * @param {Function} listener
 * @return {boolean}
 * */
Radio.prototype.isSubscribed = function(channel, listener) {
  return this.channelExists(channel) && this.channel(channel).isSubscribed(listener)
}

/**
 * Send arguments on a channel.
 * If the channel doesn't exists nothing happens.
 *
 * @alias broadcast
 * @param {Channel|String} channel
 * @return {*}
 * */
Radio.prototype.publish = function(channel) {
  if (this.channelExists(channel)) {
    channel = this.channel(channel)
    var args = [].slice.call(arguments, 1)
    return channel.broadcast.apply(channel, args)
  }
  return false
}
Radio.prototype.broadcast = Radio.prototype.publish

/**
 * Subscribe to a channel with a listener.
 * It also creates the channel if it doesn't exists yet.
 *
 * @param {Channel|String} channel
 * @param {Function} listener
 * @return {Radio} this
 * */
Radio.prototype.subscribe = function(channel, listener) {
  this.channel(channel).subscribe(listener)
  return this
}

/**
 * Unsubscribe a listener from a channel.
 * If the channel doesn't exists nothing happens.
 *
 * @param {Channel|String} channel
 * @param {Function} listener
 * @return {Radio} this
 * */
Radio.prototype.unsubscribe = function(channel, listener) {
  if (this.channelExists(channel)) {
    this.channel(channel).unsubscribe(listener)
  }
  return this
}

/**
 * Subscribe a listener to a channel
 * that unsubscribes after the first broadcast it receives.
 * It also creates the channel if it doesn't exists yet.
 *
 * @param {Channel|String} channel
 * @param {Function} listener
 * @return {Radio} this
 * */
Radio.prototype.peek = function(channel, listener) {
  this.channel(channel).peek(listener)
  return this
}

/**
 * Empty a channel removing every subscriber it holds,
 * but not deleting the channel itself.
 * If the channel doesn't exists nothing happens.
 *
 * @param {Channel|String} channel
 * @return {Radio} this
 * */
Radio.prototype.emptyChannel = function(channel) {
  if (this.channelExists(channel)) {
    this.channel(channel).empty()
  }
  return this
}

},{"./Channel":31}],33:[function(require,module,exports){
var Radio = require("./Radio")
var Channel = require("./Channel")

module.exports = Radio
module.exports.Channel = Channel

},{"./Channel":31,"./Radio":32}],34:[function(require,module,exports){
var inherit = require("backyard/function/inherit")
var include = require("backyard/function/include")
var Selector = require("matchbox-dom/Selector")
var Event = require("./Event")
var Child = require("./Child")

module.exports = Action

Action.DEFAULT_ATTRIBUTE = "data-action"

function Action (actionInit) {
  this.lookup = actionInit.lookup || null
  this.event = new Event(actionInit.eventOptions)
}

Action.prototype.initialize = function (action, viewName) {
  var selector = new Selector({attribute: Action.DEFAULT_ATTRIBUTE, value: action})

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

  var lookup = this.lookup
  this.event.transform = function (view, delegateSelector, delegateElement) {
    var child
    if (delegateSelector instanceof Child) {
      child = view.getChildView(delegateSelector.name, delegateElement)
    }
    else if (delegateSelector instanceof Selector && lookup) {
      child = view.getChildView(lookup, delegateElement)
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

},{"./Child":36,"./Event":38,"backyard/function/include":4,"backyard/function/inherit":5,"matchbox-dom/Selector":15}],35:[function(require,module,exports){
module.exports = ActionInit

function ActionInit (event, target, lookup, handler) {
  if (!(this instanceof ActionInit)) {
    switch (arguments.length) {
      case 1:
        return new ActionInit(event || {})
      case 2:
        return new ActionInit({
          type: event,
          handler: target
        })
      case 3:
        return new ActionInit({
          type: event,
          target: target,
          handler: lookup
        })
      case 4:
        return new ActionInit({
          type: event,
          target: target,
          lookup: lookup,
          handler: handler
        })
    }
  }

  switch (arguments.length) {
    case 1:
      event = event || {}
      break
    case 2:
      event = {
        type: event,
        handler: target
      }
      break
    case 3:
      event = {
        type: event,
        target: target,
        handler: lookup
      }
      break
    case 4:
      event = {
        type: event,
        target: target,
        lookup: lookup,
        handler: handler
      }
      break
  }

  this.eventOptions = event
  this.lookup = event.lookup
}

},{}],36:[function(require,module,exports){
var inherit = require("backyard/function/inherit")
var Selector = require("matchbox-dom/Selector")

module.exports = Child

Child.DEFAULT_ATTRIBUTE = "data-view"

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
  this.property = child.property || this.value
  this.lookup = child.lookup || null
  this.name = child.name || this.value
}

inherit(Child, Selector)

Child.prototype.initialize = function (property, childName) {
  this.property = property
  this.name = childName
}

Child.prototype.clone = function () {
  return new this.constructor(this)
}

},{"backyard/function/inherit":5,"matchbox-dom/Selector":15}],37:[function(require,module,exports){
var inherit = require("backyard/function/inherit")
var ModifierInit = require("./ModifierInit")

module.exports = EnumModifier

function EnumModifier (defaultValue, values, animationDuration) {
  if (!(this instanceof EnumModifier)) {
    return new EnumModifier(defaultValue, values, animationDuration)
  }

  this.type = "enum"
  this.default = defaultValue
  this.values = values
  this.animationDuration = animationDuration
}

inherit(EnumModifier, ModifierInit)

},{"./ModifierInit":41,"backyard/function/inherit":5}],38:[function(require,module,exports){
var delegate = require("matchbox-dom/event/delegate")
var Selector = require("matchbox-dom/Selector")
var Child = require("./Child")

module.exports = Event

function Event (eventInit) {
  this.type = eventInit.type
  this.target = eventInit.target
  this.once = !!eventInit.once
  this.capture = !!eventInit.capture
  this.handler = eventInit.handler
  this.transform = eventInit.transform
  this.proxy = this.handler
}

Event.prototype.initialize = function (view, viewName) {
  if (this.target) {
    if (!Array.isArray(this.target)) {
      this.target = [this.target]
    }

    this.target = this.target.map(function (selector) {
      if (!(typeof selector == "string")) {
        return selector
      }

      if (selector[0] != Selector.DEFAULT_NEST_SEPARATOR) {
        return new Child(selector)
      }

      selector = selector.substr(1)
      return view.children[selector]
    })
  }

  if (!this.transform) {
    this.transform = function (view, delegateSelector, delegateElement) {
      var child
      if (delegateSelector instanceof Child) {
        child = view.getChildView(delegateSelector.property, delegateElement)
      }

      return child || delegateElement
    }
  }
}

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

},{"./Child":36,"matchbox-dom/Selector":15,"matchbox-dom/event/delegate":22}],39:[function(require,module,exports){
module.exports = EventInit

function EventInit (event, target, capture, once, handler) {
  if (!(this instanceof EventInit)) {
    switch (arguments.length) {
      case 1:
        return new EventInit(event)
      case 2:
        return new EventInit({
          type: event,
          handler: target
        })
      case 3:
        return new EventInit({
          type: event,
          target: target,
          handler: capture
        })
      case 4:
        return new EventInit({
          type: event,
          target: target,
          capture: capture,
          handler: once
        })
      case 5:
        return new EventInit({
          type: event,
          target: target,
          capture: capture,
          once: once,
          handler: handler
        })
    }
  }

  switch (arguments.length) {
    case 1:
        event = {type: event}
      break
    case 2:
      event = {
        type: event,
        handler: target
      }
      break
    case 3:
      event = {
        type: event,
        target: target,
        handler: capture
      }
      break
    case 4:
      event = {
        type: event,
        target: target,
        capture: capture,
        handler: once
      }
      break
    case 5:
      event = {
        type: event,
        target: target,
        capture: capture,
        once: once,
        handler: handler
      }
      break
  }

  this.type = event.type
  this.target = event.target
  this.once = !!event.once
  this.capture = !!event.capture
  this.handler = event.handler
  this.transform = event.transform
}

},{}],40:[function(require,module,exports){
module.exports = Modifier

function Modifier (modifInit) {
  this.type = modifInit.type
  this.default = modifInit.default == null ? null : modifInit.default
  this.values = []
  this.value = null
  this.onchange = null
  this.animationDuration = modifInit.animationDuration || 0
  this.timerId = null
  switch (this.type) {
    case "switch":
      this.values.push(modifInit.on && typeof modifInit.on == "string" ? modifInit.on : null)
      this.values.push(modifInit.off && typeof modifInit.off == "string" ? modifInit.off : null)
      break
    case "enum":
      this.values = modifInit.values || []
      break
  }
}

Modifier.prototype.reset = function (element, context) {
  var currentValue
  var hasInitialValue = this.values.some(function (value) {
    if (value && element.classList.contains(value)) {
      currentValue = value
      return true
    }
    return false
  })

  if (hasInitialValue) {
    if (this.type == "switch") {
      // on
      if (currentValue === this.values[0]) {
        this.value = true
      }
      // off
      if (currentValue === this.values[1]) {
        this.value = false
      }
    }
    else {
      this.value = currentValue
    }
  }
  else if (this.default != null) {
    this.set(this.default, element, context)
  }
}

Modifier.prototype.get = function () {
  return this.value
}

Modifier.prototype.set = function (value, element, context) {
  context = context || element

  var previousValue = this.value
  var previousClassName = previousValue
  var newValue = value
  var newClassName = value

  if (this.type == "switch") {
    newValue = !!value

    var on = this.values[0]
    var off = this.values[1]

    previousClassName = previousValue == null
        ? null
        : previousValue ? on : off
    newClassName = newValue ? on : off
  }

  if (previousValue === newValue || !~this.values.indexOf(newClassName)) {
    return Promise.resolve()
  }
  if (previousClassName && element.classList.contains(previousClassName)) {
    element.classList.remove(previousClassName)
  }
  this.value = newValue
  if (newClassName) {
    element.classList.add(newClassName)
  }

  return callOnChange(this, context, previousValue, newValue)
}

Modifier.prototype.remove = function (element, context) {
  context = context || element
  if (this.value == null) {
    return Promise.resolve()
  }
  if (this.timerId) {
    clearTimeout(this.timerId)
    this.timerId = null
  }

  var previousValue = this.value
  var previousClassName = previousValue

  if (this.type == "switch") {
    var on = this.values[0]
    var off = this.values[1]

    previousClassName = previousValue == null
        ? null
        : previousValue ? on : off
  }

  if (previousClassName && element.classList.contains(previousClassName)) {
    element.classList.remove(previousClassName)
  }
  this.value = null

  return callOnChange(this, context, previousValue, null)
}

function callOnChange (modifier, context, previousValue, newValue) {
  return new Promise(function (resolve) {
    if (modifier.animationDuration) {
      if (modifier.timerId) {
        clearTimeout(modifier.timerId)
        modifier.timerId = null
      }
      modifier.timerId = setTimeout(resolve, modifier.animationDuration)
    }
    else {
      resolve()
    }
  }).then(function () {
        if (typeof modifier.onchange == "function") {
          return modifier.onchange.call(context, previousValue, newValue)
        }
      })
}

},{}],41:[function(require,module,exports){
module.exports = ModifierInit

function ModifierInit (options) {
  this.type = options.type
  this.default = options.default == null ? null : options.default
  this.values = options.values
  this.animationDuration = options.animationDuration
}

},{}],42:[function(require,module,exports){
var inherit = require("backyard/function/inherit")
var ModifierInit = require("./ModifierInit")

module.exports = SwitchModifier

function SwitchModifier (defaultValue, on, off, animationDuration) {
  if (!(this instanceof SwitchModifier)) {
    return new SwitchModifier(defaultValue, on, off, animationDuration)
  }

  this.type = "switch"
  this.default = defaultValue
  this.on = on
  this.off = off
  this.animationDuration = animationDuration
}

inherit(SwitchModifier, ModifierInit)

},{"./ModifierInit":41,"backyard/function/inherit":5}],43:[function(require,module,exports){
var define = require("backyard/object/define")
var defaults = require("backyard/object/defaults")
var forIn = require("backyard/object/in")
var factory = require("offspring")
var InstanceExtension = factory.InstanceExtension
var CacheExtension = factory.CacheExtension
var DomData = require("matchbox-dom/Data")
var domData = require("matchbox-dom/data")
var Selector = require("matchbox-dom/Selector")
var Fragment = require("matchbox-dom/Fragment")
var Radio = require("stations")

var EventInit = require("./EventInit")
var ActionInit = require("./ActionInit")
var ModifierInit = require("./ModifierInit")
var Event = require("./Event")
var Modifier = require("./Modifier")
var Child = require("./Child")
var Action = require("./Action")

var View = module.exports = factory({
  include: [Radio],

  extensions: {
    layouts: new CacheExtension(),
    models: new CacheExtension(),
    events: new InstanceExtension(function (view, name, init) {
      var event
      if (!(init instanceof EventInit)) {
        init = new EventInit(init)
      }
      event = new Event(init)

      if (typeof event.handler == "string" && typeof view[event.handler] == "function") {
        event.handler = view[event.handler].bind(view)
      }

      if (view.viewName) {
        event.initialize(view, view.viewName)
      }

      view._events[name] = event
    }),
    actions: new InstanceExtension(function (view, name, init) {
      if (!(init instanceof ActionInit)) {
        init = new ActionInit(init)
      }

      var action = new Action(init)
      action.initialize(name, view.viewName)

      if (typeof action.handler == "string" && typeof view[action.handler] == "function") {
        action.handler = function () {
          return view[action.handler].apply(view, arguments)
        }
      }
      view._actions[name] = action
    }),
    dataset: new CacheExtension(function (prototype, name, data) {
      if (!(data instanceof DomData)) {
        data = domData.create(name, data)
      }
      data.name = data.name || name

      return data
    }),
    modifiers: new InstanceExtension(function (view, name, modifInit) {
      if (!(modifInit instanceof ModifierInit)) {
        modifInit = new ModifierInit(modifInit)
      }
      view._modifiers[name] = new Modifier(modifInit)
    }),
    children: new CacheExtension(function(prototype, name, child){
      if (!(child instanceof Selector)) {
        child = new Child(child)
      }

      if (child instanceof Child) {
        child.initialize(name, child.value || name)
      }

      if (prototype.viewName) {
        if (child instanceof Child) {
          return child.contains(child.name).prefix(prototype.viewName)
        }
      }
      return child.contains(child.name)
    }),
    fragments: new CacheExtension(function (prototype, name, fragment) {
      if (!(fragment instanceof Fragment)) {
        return new Fragment(fragment)
      }
      return fragment
    })
  },

  layouts: {},
  models: {},
  events: {},
  dataset: {},
  modifiers: {},
  fragments: {},
  children: {},

  constructor: function View( element ){
    Radio.call(this)
    define.value(this, "_events", {})
    define.value(this, "_models", {})
    define.value(this, "_actions", {})
    define.value(this, "_modifiers", {})
    define.writable.value(this, "_element", null)
    define.writable.value(this, "currentLayout", "")
    View.initialize(this)
    this.element = element
  },

  accessor: {
    element: {
      get: function () {
        return this._element
      },
      set: function (element) {
        var previous = this._element
        if (previous == element) {
          return
        }
        this._element = element
        this.onElementChange(element, previous)
      }
    },
    elementSelector: {
      get: function () {
        if (this.viewName) {
          return new Child(this.viewName)
        }
      }
    }
  },

  prototype: {
    viewName: "",
    onElementChange: function (element, previous) {
      var view = this
      forIn(this._events, function (name, event) {
        if (previous) event.unRegister(previous)
        if (element) event.register(element, view)
      })
      forIn(this._actions, function (name, action) {
        if (previous) action.unRegisterEvent(previous)
        if (element) action.registerEvent(element, view)
      })
      forIn(this._modifiers, function (name, modifier) {
        modifier.reset(element, view)
      })
      forIn(this.dataset, function (name, data) {
        if (!data.has(element) && data.default != null) {
          data.set(element, data.default)
        }
      })
      forIn(this.children, function (name) {
        var child = view.children[name]
        if (child && child.autoselect) {
          view[name] = view.findChild(name)
        }
      })
      forIn(this.models, function (name, Constructor) {
        view._models[name] = new Constructor()
      })
    },
    onLayoutChange: function (layout, previous) {},
    changeLayout: function( layout ){
      if (this.currentLayout == layout) {
        return Promise.resolve()
      }

      var layoutHandler = this.layouts[layout]
      if (typeof layoutHandler != "function") {
        return Promise.reject(new Error("Invalid layout handler: " + layout))
      }

      var view = this
      var previous = view.currentLayout
      return Promise.resolve(previous).then(function () {
        return layoutHandler.call(view, previous)
      }).then(function () {
        view.currentLayout = layout
        view.onLayoutChange(previous, layout)
      })
    },
    dispatch: function (type, detail, def) {
      var definition = defaults(def, {
        detail: detail || null,
        view: window,
        bubbles: true,
        cancelable: true
      })
      return this.element.dispatchEvent(new window.CustomEvent(type, definition))
    },
    getData: function (name) {
      var data = this.dataset[name]
      if (data) {
        return data.get(this.element)
      }
      return null
    },
    setData: function (name, value, silent) {
      var data = this.dataset[name]
      if (data) {
        return data.set(this.element, value, silent)
      }
    },
    removeData: function (name, silent) {
      var data = this.dataset[name]
      if (data) {
        data.remove(this.element, silent)
      }
    },
    hasData: function (name) {
      var data = this.dataset[name]
      if (data) {
        return data.has(this.element)
      }
      return false
    },
    setModifier: function (name, value) {
      if (this._modifiers[name] && this.element) {
        return this._modifiers[name].set(value, this.element, this)
      }
    },
    getModifier: function (name) {
      if (this._modifiers[name]) {
        return this._modifiers[name].get()
      }
    },
    removeModifier: function (name) {
      if (this._modifiers[name]) {
        return this._modifiers[name].remove(this.element, this)
      }
    },
    getModel: function (name) {
      name = name || "default"
      var model = this._models[name]
      if (model == null) {
        throw new Error("Unable to access unknown model")
      }

      return model
    },
    setModel: function (name, model) {
      if (!model) {
        model = name
        name = "default"
      }
      this._models[name] = model
    },
    setupElement: function (root) {
      root = root || document.body
      if (root && this.elementSelector) {
        this.element = this.elementSelector.from(root).find()
      }

      return this
    },
    getChildView: function (childProperty, element) {
      var child = this.children[childProperty]
      var member = this[childProperty]

      if (child && child.multiple || Array.isArray(member)) {
        var l = member.length
        while (l--) {
          if (member[l].element == element) {
            return member[l]
          }
        }

        return null
      }

      return member
    },
    findChild: function (property) {
      var child
      if (typeof property == "string") {
        child = this.children[property]
      }
      else if (property instanceof Selector) {
        child = property
      }

      if (child) {
        var element = child.from(this.element, this.elementSelector).find()
        if (element && child.lookup) {
          return this.getChildView(child.lookup, element)
        }
        return element
      }

      return null
    }
  }
})

},{"./Action":34,"./ActionInit":35,"./Child":36,"./Event":38,"./EventInit":39,"./Modifier":40,"./ModifierInit":41,"backyard/object/defaults":8,"backyard/object/define":9,"backyard/object/in":11,"matchbox-dom/Data":13,"matchbox-dom/Fragment":14,"matchbox-dom/Selector":15,"matchbox-dom/data":21,"offspring":24,"stations":33}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9iYWNreWFyZC9mdW5jdGlvbi9hdWdtZW50LmpzIiwibm9kZV9tb2R1bGVzL2JhY2t5YXJkL2Z1bmN0aW9uL2V4dGVuZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWNreWFyZC9mdW5jdGlvbi9pbmNsdWRlLmpzIiwibm9kZV9tb2R1bGVzL2JhY2t5YXJkL2Z1bmN0aW9uL2luaGVyaXQuanMiLCJub2RlX21vZHVsZXMvYmFja3lhcmQvb2JqZWN0L0Rlc2NyaXB0b3IuanMiLCJub2RlX21vZHVsZXMvYmFja3lhcmQvb2JqZWN0L2NvcHkuanMiLCJub2RlX21vZHVsZXMvYmFja3lhcmQvb2JqZWN0L2RlZmF1bHRzLmpzIiwibm9kZV9tb2R1bGVzL2JhY2t5YXJkL29iamVjdC9kZWZpbmUuanMiLCJub2RlX21vZHVsZXMvYmFja3lhcmQvb2JqZWN0L2V4dGVuZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWNreWFyZC9vYmplY3QvaW4uanMiLCJub2RlX21vZHVsZXMvYmFja3lhcmQvb2JqZWN0L21lcmdlLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWRvbS9EYXRhLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWRvbS9GcmFnbWVudC5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1kb20vU2VsZWN0b3IuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZG9tL2RhdGEvQm9vbGVhbkRhdGEuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZG9tL2RhdGEvRmxvYXREYXRhLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWRvbS9kYXRhL0pTT05EYXRhLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWRvbS9kYXRhL051bWJlckRhdGEuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZG9tL2RhdGEvU3RyaW5nRGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1kb20vZGF0YS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1kb20vZXZlbnQvZGVsZWdhdGUuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZG9tL25vZGVfbW9kdWxlcy9tYXRjaGJveC1mYWN0b3J5L2luaGVyaXQuanMiLCJub2RlX21vZHVsZXMvb2Zmc3ByaW5nL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL29mZnNwcmluZy9zcmMvQmx1ZXByaW50LmpzIiwibm9kZV9tb2R1bGVzL29mZnNwcmluZy9zcmMvQ2FjaGVFeHRlbnNpb24uanMiLCJub2RlX21vZHVsZXMvb2Zmc3ByaW5nL3NyYy9FeHRlbnNpb24uanMiLCJub2RlX21vZHVsZXMvb2Zmc3ByaW5nL3NyYy9GYWN0b3J5LmpzIiwibm9kZV9tb2R1bGVzL29mZnNwcmluZy9zcmMvSW5zdGFuY2VFeHRlbnNpb24uanMiLCJub2RlX21vZHVsZXMvb2Zmc3ByaW5nL3NyYy9Qcm90b3R5cGVFeHRlbnNpb24uanMiLCJub2RlX21vZHVsZXMvc3RhdGlvbnMvQ2hhbm5lbC5qcyIsIm5vZGVfbW9kdWxlcy9zdGF0aW9ucy9SYWRpby5qcyIsIm5vZGVfbW9kdWxlcy9zdGF0aW9ucy9pbmRleC5qcyIsInZpZXcvQWN0aW9uLmpzIiwidmlldy9BY3Rpb25Jbml0LmpzIiwidmlldy9DaGlsZC5qcyIsInZpZXcvRW51bU1vZGlmaWVyLmpzIiwidmlldy9FdmVudC5qcyIsInZpZXcvRXZlbnRJbml0LmpzIiwidmlldy9Nb2RpZmllci5qcyIsInZpZXcvTW9kaWZpZXJJbml0LmpzIiwidmlldy9Td2l0Y2hNb2RpZmllci5qcyIsInZpZXcvVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgdWkgPSBtb2R1bGUuZXhwb3J0cyA9IHt9XG5cbnVpLmRhdGEgPSByZXF1aXJlKFwibWF0Y2hib3gtZG9tL2RhdGFcIilcbnVpLlZpZXcgPSByZXF1aXJlKFwiLi92aWV3L1ZpZXdcIilcbnVpLkNoaWxkID0gcmVxdWlyZShcIi4vdmlldy9DaGlsZFwiKVxudWkuRXZlbnQgPSByZXF1aXJlKFwiLi92aWV3L0V2ZW50SW5pdFwiKVxudWkuQWN0aW9uID0gcmVxdWlyZShcIi4vdmlldy9BY3Rpb25Jbml0XCIpXG51aS5Nb2RpZmllciA9IHJlcXVpcmUoXCIuL3ZpZXcvTW9kaWZpZXJJbml0XCIpXG51aS5Td2l0Y2hNb2RpZmllciA9IHJlcXVpcmUoXCIuL3ZpZXcvU3dpdGNoTW9kaWZpZXJcIilcbnVpLkVudW1Nb2RpZmllciA9IHJlcXVpcmUoXCIuL3ZpZXcvRW51bU1vZGlmaWVyXCIpXG4iLCIvKipcbiAqIEFwcGx5IG9uZSBvciBtb3JlIGZ1bmN0aW9uYWwgbWl4aW5zIHRvIGEgY29uc3RydWN0b3IncyBwcm90b3R5cGUuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gQ29uc3RydWN0b3JcbiAqIEBwYXJhbSB7RnVuY3Rpb258RnVuY3Rpb25bXX0gbWl4aW5cbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gQ29uc3RydWN0b3JcbiAqICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGF1Z21lbnQoQ29uc3RydWN0b3IsIG1peGluKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KG1peGluKSkge1xuICAgIG1peGluLmZvckVhY2goZnVuY3Rpb24oZnVuYykge1xuICAgICAgaWYgKHR5cGVvZiBmdW5jID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBmdW5jLmNhbGwoQ29uc3RydWN0b3IucHJvdG90eXBlKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIG1peGluID09IFwiZnVuY3Rpb25cIikge1xuICAgIG1peGluLmNhbGwoQ29uc3RydWN0b3IucHJvdG90eXBlKVxuICB9XG5cbiAgcmV0dXJuIENvbnN0cnVjdG9yXG59XG4iLCIvKipcbiAqIEV4dGVuZCBhIHNpbmdsZSBjb25zdHJ1Y3RvcidzIHByb3RvdHlwZSB3aXRoIGEgcHJvdG90eXBlIG9iamVjdFxuICogY29weWluZyBtZXRob2RzIHdpdGggdGhlIHNhbWUgcHJvcGVydHkgZGVzY3JpcHRvci5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBDb25zdHJ1Y3RvclxuICogQHBhcmFtIHtPYmplY3R9IHByb3RvdHlwZVxuICpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBDb25zdHJ1Y3RvclxuICogKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKENvbnN0cnVjdG9yLCBwcm90b3R5cGUpIHtcbiAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocHJvdG90eXBlKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gXCJjb25zdHJ1Y3RvclwiKSB7XG4gICAgICB2YXIgZGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocHJvdG90eXBlLCBuYW1lKVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbnN0cnVjdG9yLnByb3RvdHlwZSwgbmFtZSwgZGVzY3JpcHRvcilcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIENvbnN0cnVjdG9yXG59XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZShcIi4vZXh0ZW5kXCIpXG5cbi8qKlxuICogRXh0ZW5kcyBhIGNvbnN0cnVjdG9yJ3MgcHJvdG90eXBlIHdpdGggb25lIG9yIG1vcmUgY29uc3RydWN0b3Igb3IgcHJvdG90eXBlIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IENvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdH0gT3RoZXJcbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gQ29uc3RydWN0b3JcbiAqICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluY2x1ZGUoQ29uc3RydWN0b3IsIE90aGVyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KE90aGVyKSkge1xuICAgIE90aGVyLmZvckVhY2goZnVuY3Rpb24oT3RoZXIpIHtcbiAgICAgIGlmICh0eXBlb2YgT3RoZXIgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGV4dGVuZChDb25zdHJ1Y3RvciwgT3RoZXIucHJvdG90eXBlKVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAodHlwZW9mIE90aGVyID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgZXh0ZW5kKENvbnN0cnVjdG9yLCBPdGhlcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIGVsc2Uge1xuICAgIGlmICh0eXBlb2YgT3RoZXIgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBleHRlbmQoQ29uc3RydWN0b3IsIE90aGVyLnByb3RvdHlwZSlcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIE90aGVyID09IFwib2JqZWN0XCIpIHtcbiAgICAgIGV4dGVuZChDb25zdHJ1Y3RvciwgT3RoZXIpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIENvbnN0cnVjdG9yXG59XG4iLCIvKipcbiAqIEluaGVyaXQgZnJvbSBhbm90aGVyIGNvbnN0cnVjdG9yXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gQ29uc3RydWN0b3JcbiAqIEBwYXJhbSB7RnVuY3Rpb259IEJhc2VcbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gQ2xhc3NcbiAqICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXQoQ29uc3RydWN0b3IsIEJhc2UpIHtcbiAgQ29uc3RydWN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSlcbiAgQ29uc3RydWN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29uc3RydWN0b3JcblxuICByZXR1cm4gQ29uc3RydWN0b3Jcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gRGVzY3JpcHRvclxuXG52YXIgcHJvcFdyaXRhYmxlID0gXCJfd3JpdGFibGVcIlxudmFyIHByb3BFbnVtZXJhYmxlID0gXCJfZW51bWVyYWJsZVwiXG52YXIgcHJvcENvbmZpZ3VyYWJsZSA9IFwiX2NvbmZpZ3VyYWJsZVwiXG5cbmZ1bmN0aW9uIERlc2NyaXB0b3Iod3JpdGFibGUsIGVudW1lcmFibGUsIGNvbmZpZ3VyYWJsZSkge1xuICB0aGlzLnZhbHVlKHRoaXMsIHByb3BXcml0YWJsZSwgd3JpdGFibGUgfHwgZmFsc2UpXG4gIHRoaXMudmFsdWUodGhpcywgcHJvcEVudW1lcmFibGUsIGVudW1lcmFibGUgfHwgZmFsc2UpXG4gIHRoaXMudmFsdWUodGhpcywgcHJvcENvbmZpZ3VyYWJsZSwgY29uZmlndXJhYmxlIHx8IGZhbHNlKVxuXG4gIHRoaXMuZ2V0dGVyKHRoaXMsIFwid1wiLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy53cml0YWJsZVxuICB9KVxuICB0aGlzLmdldHRlcih0aGlzLCBcIndyaXRhYmxlXCIsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgRGVzY3JpcHRvcih0cnVlLCBlbnVtZXJhYmxlLCBjb25maWd1cmFibGUpXG4gIH0pXG5cbiAgdGhpcy5nZXR0ZXIodGhpcywgXCJlXCIsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmVudW1lcmFibGVcbiAgfSlcbiAgdGhpcy5nZXR0ZXIodGhpcywgXCJlbnVtZXJhYmxlXCIsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgRGVzY3JpcHRvcih3cml0YWJsZSwgdHJ1ZSwgY29uZmlndXJhYmxlKVxuICB9KVxuXG4gIHRoaXMuZ2V0dGVyKHRoaXMsIFwiY1wiLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWd1cmFibGVcbiAgfSlcbiAgdGhpcy5nZXR0ZXIodGhpcywgXCJjb25maWd1cmFibGVcIiwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEZXNjcmlwdG9yKHdyaXRhYmxlLCBlbnVtZXJhYmxlLCB0cnVlKVxuICB9KVxufVxuXG5EZXNjcmlwdG9yLnByb3RvdHlwZSA9IHtcbiAgYWNjZXNzb3I6IGZ1bmN0aW9uKG9iaiwgbmFtZSwgZ2V0dGVyLCBzZXR0ZXIpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICBlbnVtZXJhYmxlOiB0aGlzW3Byb3BFbnVtZXJhYmxlXSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdGhpc1twcm9wQ29uZmlndXJhYmxlXSxcbiAgICAgIGdldDogZ2V0dGVyLFxuICAgICAgc2V0OiBzZXR0ZXJcbiAgICB9KVxuICAgIHJldHVybiB0aGlzXG4gIH0sXG4gIGdldHRlcjogZnVuY3Rpb24ob2JqLCBuYW1lLCBmbikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgIGVudW1lcmFibGU6IHRoaXNbcHJvcEVudW1lcmFibGVdLFxuICAgICAgY29uZmlndXJhYmxlOiB0aGlzW3Byb3BDb25maWd1cmFibGVdLFxuICAgICAgZ2V0OiBmblxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgc2V0dGVyOiBmdW5jdGlvbihvYmosIG5hbWUsIGZuKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgICAgZW51bWVyYWJsZTogdGhpc1twcm9wRW51bWVyYWJsZV0sXG4gICAgICBjb25maWd1cmFibGU6IHRoaXNbcHJvcENvbmZpZ3VyYWJsZV0sXG4gICAgICBzZXQ6IGZuXG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9LFxuICB2YWx1ZTogZnVuY3Rpb24ob2JqLCBuYW1lLCB2YWx1ZSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgIHdyaXRhYmxlOiB0aGlzW3Byb3BXcml0YWJsZV0sXG4gICAgICBlbnVtZXJhYmxlOiB0aGlzW3Byb3BFbnVtZXJhYmxlXSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdGhpc1twcm9wQ29uZmlndXJhYmxlXSxcbiAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgbWV0aG9kOiBmdW5jdGlvbihvYmosIG5hbWUsIGZuKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgICAgd3JpdGFibGU6IHRoaXNbcHJvcFdyaXRhYmxlXSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgY29uZmlndXJhYmxlOiB0aGlzW3Byb3BDb25maWd1cmFibGVdLFxuICAgICAgdmFsdWU6IGZuXG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9LFxuICBwcm9wZXJ0eTogZnVuY3Rpb24ob2JqLCBuYW1lLCB2YWx1ZSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgIHdyaXRhYmxlOiB0aGlzW3Byb3BXcml0YWJsZV0sXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdGhpc1twcm9wQ29uZmlndXJhYmxlXSxcbiAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgY29uc3RhbnQ6IGZ1bmN0aW9uKG9iaiwgbmFtZSwgdmFsdWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICB2YWx1ZTogdmFsdWVcbiAgICB9KVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cbiIsInZhciBleHRlbmQgPSByZXF1aXJlKFwiLi9leHRlbmRcIilcblxuLyoqXG4gKiBTaGFsbG93IGNvcHkgYW4gb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gYSBjb3B5IG9mIHRoZSBvYmplY3RcbiAqICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gZXh0ZW5kKHt9LCBvYmopXG59XG4iLCJ2YXIgY29weSA9IHJlcXVpcmUoXCIuL2NvcHlcIilcbi8qKlxuICogUmV0dXJuIGEgbmV3IG9iamVjdCB3aXRoIGV4dGVuZGVkIGtleXMgdG8gY29udGFpbiBkZWZhdWx0IHZhbHVlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRWYWx1ZXNcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IG1lcmdlZCBvYmplY3RcbiAqICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmF1bHRzKG9wdGlvbnMsIGRlZmF1bHRWYWx1ZXMpIHtcbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgcmV0dXJuIGNvcHkoZGVmYXVsdFZhbHVlcylcbiAgfVxuXG4gIHZhciBvYmogPSBjb3B5KG9wdGlvbnMpXG5cbiAgZm9yICh2YXIgcHJvcCBpbiBkZWZhdWx0VmFsdWVzKSB7XG4gICAgaWYgKGRlZmF1bHRWYWx1ZXMuaGFzT3duUHJvcGVydHkocHJvcCkgJiYgIW9wdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgIG9ialtwcm9wXSA9IGRlZmF1bHRWYWx1ZXNbcHJvcF1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqXG59XG4iLCJ2YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL0Rlc2NyaXB0b3JcIilcblxuLyoqXG4gKiBEZWZpbmUgYSBwcm9wZXJ0eSB3aXRoIGEgZGVzY3JpcHRvclxuICogKi9cbm1vZHVsZS5leHBvcnRzID0gbmV3IERlc2NyaXB0b3IoKVxuIiwiLyoqXG4gKiBFeHRlbmQgYW4gb2JqZWN0IHdpdGggYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7T2JqZWN0fSBleHRlbnNpb25cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IG9ialxuICogKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKG9iaiwgZXh0ZW5zaW9uKSB7XG4gIGZvciAodmFyIG5hbWUgaW4gZXh0ZW5zaW9uKSB7XG4gICAgaWYgKGV4dGVuc2lvbi5oYXNPd25Qcm9wZXJ0eShuYW1lKSkgb2JqW25hbWVdID0gZXh0ZW5zaW9uW25hbWVdXG4gIH1cbiAgcmV0dXJuIG9ialxufVxuIiwiLyoqXG4gKiBTYWZlbHkgaXRlcmF0ZSBvbiBhbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayhTdHJpbmcga2V5LCAqIHZhbHVlLCBPYmplY3Qgb2JqKVxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gb2JqXG4gKiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmosIGNhbGxiYWNrKSB7XG4gIGZvciAodmFyIHByb3AgaW4gb2JqKSB7XG4gICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgY2FsbGJhY2socHJvcCwgb2JqW3Byb3BdLCBvYmopXG4gICAgfVxuICB9XG4gIHJldHVybiBvYmpcbn1cbiIsInZhciBleHRlbmQgPSByZXF1aXJlKFwiLi9leHRlbmRcIilcblxuLyoqXG4gKiBNZXJnZSB0d28gb2JqZWN0cyBhbmQgcmV0dXJuIGEgbmV3IG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYmFzZVxuICogQHBhcmFtIHtPYmplY3R9IGV4dGVuc2lvblxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gYmFzZVxuICogKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYmFzZSwgZXh0ZW5zaW9uKSB7XG4gIHJldHVybiBleHRlbmQoZXh0ZW5kKHt9LCBiYXNlKSwgZXh0ZW5zaW9uKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBEb21EYXRhXG5cbmZ1bmN0aW9uIERvbURhdGEgKG5hbWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpIHtcbiAgdGhpcy5uYW1lID0gbmFtZVxuICB0aGlzLm9uQ2hhbmdlID0gb25DaGFuZ2UgfHwgbnVsbFxuICB0aGlzLmRlZmF1bHQgPSBkZWZhdWx0VmFsdWUgPT0gbnVsbCA/IG51bGwgOiBkZWZhdWx0VmFsdWVcbn1cblxuRG9tRGF0YS5wcm90b3R5cGUudHlwZSA9IFwiXCJcblxuRG9tRGF0YS5wcm90b3R5cGUuYXR0cmlidXRlTmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIFwiZGF0YS1cIit0aGlzLm5hbWVcbn1cbkRvbURhdGEucHJvdG90eXBlLmNoZWNrVHlwZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbFxufVxuXG5Eb21EYXRhLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWVcbn1cblxuRG9tRGF0YS5wcm90b3R5cGUuc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiBcIlwiK3ZhbHVlXG59XG5cbkRvbURhdGEucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHZhciBhdHRyaWJ1dGVOYW1lID0gdGhpcy5hdHRyaWJ1dGVOYW1lKClcbiAgaWYgKGVsZW1lbnQuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2UoZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSkpXG4gIH1cblxuICByZXR1cm4gdGhpcy5kZWZhdWx0XG59XG5cbkRvbURhdGEucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZSwgY29udGV4dCwgc2lsZW50KSB7XG4gIGlmICghdGhpcy5jaGVja1R5cGUodmFsdWUpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbid0IHNldCBEb21EYXRhIFwiK3RoaXMudHlwZStcIiB0byAnXCIrdmFsdWUrXCInXCIpXG4gIH1cblxuICB2YXIgYXR0cmlidXRlTmFtZSA9IHRoaXMuYXR0cmlidXRlTmFtZSgpXG5cbiAgdmFyIGhhc1ZhbHVlID0gZWxlbWVudC5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSlcbiAgdmFyIG5ld1N0cmluZ1ZhbHVlID0gdGhpcy5zdHJpbmdpZnkodmFsdWUpXG4gIHZhciBwcmV2U3RyaW5nVmFsdWUgPSBoYXNWYWx1ZSA/IGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpIDogbnVsbFxuXG4gIGlmIChuZXdTdHJpbmdWYWx1ZSA9PT0gcHJldlN0cmluZ1ZhbHVlKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBuZXdTdHJpbmdWYWx1ZSlcblxuICBpZiAoIXNpbGVudCkge1xuICAgIHZhciBvbkNoYW5nZSA9IHRoaXMub25DaGFuZ2VcbiAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgIHZhciBwcmV2aW91c1ZhbHVlID0gaGFzVmFsdWUgPyB0aGlzLnBhcnNlKHByZXZTdHJpbmdWYWx1ZSkgOiBudWxsXG4gICAgICBvbkNoYW5nZS5jYWxsKGNvbnRleHQsIHByZXZpb3VzVmFsdWUsIHZhbHVlKVxuICAgIH1cbiAgfVxufVxuXG5Eb21EYXRhLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICByZXR1cm4gZWxlbWVudC5oYXNBdHRyaWJ1dGUodGhpcy5hdHRyaWJ1dGVOYW1lKCkpXG59XG5cbkRvbURhdGEucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBjb250ZXh0LCBzaWxlbnQpIHtcbiAgdmFyIGF0dHJpYnV0ZU5hbWUgPSB0aGlzLmF0dHJpYnV0ZU5hbWUoKVxuICBpZiAoIWVsZW1lbnQuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgcHJldmlvdXNWYWx1ZSA9IGVsZW1lbnQuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpXG4gICAgICA/IHRoaXMucGFyc2UoZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSkpXG4gICAgICA6IG51bGxcblxuICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKVxuXG4gIGlmICghc2lsZW50KSB7XG4gICAgdmFyIG9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZVxuICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgb25DaGFuZ2UuY2FsbChjb250ZXh0LCBwcmV2aW91c1ZhbHVlLCBudWxsKVxuICAgIH1cbiAgfVxufVxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IEZyYWdtZW50XG5cbmZ1bmN0aW9uIEZyYWdtZW50IChmcmFnbWVudCkge1xuICBmcmFnbWVudCA9IGZyYWdtZW50IHx8IHt9XG4gIHRoaXMuaHRtbCA9IGZyYWdtZW50Lmh0bWwgfHwgXCJcIlxuICB0aGlzLmZpcnN0ID0gZnJhZ21lbnQuZmlyc3QgPT0gdW5kZWZpbmVkIHx8ICEhZnJhZ21lbnQuZmlyc3RcbiAgdGhpcy50aW1lb3V0ID0gZnJhZ21lbnQudGltZW91dCB8fCAyMDAwXG59XG5cbkZyYWdtZW50LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbiAoaHRtbCkge1xuICB2YXIgdGVtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cbiAgdGVtcC5pbm5lckhUTUwgPSBodG1sIHx8IHRoaXMuaHRtbFxuXG4gIGlmICh0aGlzLmZpcnN0ID09PSB1bmRlZmluZWQgfHwgdGhpcy5maXJzdCkge1xuICAgIHJldHVybiB0ZW1wLmNoaWxkcmVuWzBdXG4gIH1cblxuICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcbiAgd2hpbGUgKHRlbXAuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZCh0ZW1wLmZpcnN0Q2hpbGQpXG4gIH1cblxuICByZXR1cm4gZnJhZ21lbnQ7XG59XG5cbkZyYWdtZW50LnByb3RvdHlwZS5jb21waWxlID0gZnVuY3Rpb24gKGh0bWwsIG9wdGlvbnMsIGNiKSB7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIGNiKG51bGwsIGh0bWwpXG4gIH0sIDQpXG59XG5cbkZyYWdtZW50LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgZnJhZ21lbnQgPSB0aGlzXG4gIGNvbnRleHQgPSBjb250ZXh0IHx8IHt9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVzb2x2ZWQgPSBmYWxzZVxuICAgIHZhciBpZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlJlbmRlciB0aW1lZCBvdXRcIikpXG4gICAgfSwgZnJhZ21lbnQudGltZW91dClcblxuICAgIHRyeSB7XG4gICAgICBmcmFnbWVudC5jb21waWxlKGNvbnRleHQsIG9wdGlvbnMsIGZ1bmN0aW9uIChlcnIsIHJlbmRlcmVkKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChpZClcbiAgICAgICAgaWYgKHJlc29sdmVkKSByZXR1cm5cblxuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmVqZWN0KGVycilcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKGZyYWdtZW50LmNyZWF0ZShyZW5kZXJlZCkpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICByZWplY3QoZSlcbiAgICB9XG4gIH0pXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFNlbGVjdG9yXG5cblNlbGVjdG9yLkRFRkFVTFRfTkVTVF9TRVBBUkFUT1IgPSBcIjpcIlxuXG5mdW5jdGlvbiBTZWxlY3RvciAoc2VsZWN0b3IpIHtcbiAgc2VsZWN0b3IgPSBzZWxlY3RvciB8fCB7fVxuICB0aGlzLmF0dHJpYnV0ZSA9IHNlbGVjdG9yLmF0dHJpYnV0ZSB8fCBcIlwiXG4gIHRoaXMudmFsdWUgPSBzZWxlY3Rvci52YWx1ZSB8fCBudWxsXG4gIHRoaXMub3BlcmF0b3IgPSBzZWxlY3Rvci5vcGVyYXRvciB8fCBcIj1cIlxuICB0aGlzLmV4dHJhID0gc2VsZWN0b3IuZXh0cmEgfHwgXCJcIlxuXG4gIHRoaXMuZWxlbWVudCA9IHNlbGVjdG9yLmVsZW1lbnQgfHwgbnVsbFxuICB0aGlzLnVud2FudGVkUGFyZW50U2VsZWN0b3IgPSBzZWxlY3Rvci51bndhbnRlZFBhcmVudFNlbGVjdG9yIHx8IG51bGxcblxuICB0aGlzLkNvbnN0cnVjdG9yID0gc2VsZWN0b3IuQ29uc3RydWN0b3IgfHwgbnVsbFxuICB0aGlzLmluc3RhbnRpYXRlID0gc2VsZWN0b3IuaW5zdGFudGlhdGUgfHwgbnVsbFxuICB0aGlzLm11bHRpcGxlID0gc2VsZWN0b3IubXVsdGlwbGUgIT0gbnVsbCA/ICEhc2VsZWN0b3IubXVsdGlwbGUgOiBmYWxzZVxuXG4gIHRoaXMubWF0Y2hlciA9IHNlbGVjdG9yLm1hdGNoZXIgfHwgbnVsbFxufVxuXG5mdW5jdGlvbiBwYXJlbnRGaWx0ZXIgKHVuTWF0Y2hTZWxlY3RvciwgcmVhbFBhcmVudCkge1xuICByZXR1cm4gZnVuY3Rpb24gaXNVbndhbnRlZENoaWxkKGVsKSB7XG4gICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudE5vZGVcbiAgICB3aGlsZSAocGFyZW50ICYmIHBhcmVudCAhPSByZWFsUGFyZW50KSB7XG4gICAgICBpZiAocGFyZW50Lm1hdGNoZXModW5NYXRjaFNlbGVjdG9yKSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cblxuU2VsZWN0b3IucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdG9yKHRoaXMpXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5jb21iaW5lID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIHZhciBzID0gdGhpcy5jbG9uZSgpXG4gIHMuZXh0cmEgKz0gc2VsZWN0b3IudG9TdHJpbmcoKVxuICByZXR1cm4gc1xufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUuZXF1YWwgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIHMgPSB0aGlzLmNsb25lKClcbiAgcy5vcGVyYXRvciA9IFwiPVwiXG4gIHMudmFsdWUgPSB2YWx1ZVxuICByZXR1cm4gc1xufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIHMgPSB0aGlzLmNsb25lKClcbiAgcy5vcGVyYXRvciA9IFwifj1cIlxuICBzLnZhbHVlID0gdmFsdWVcbiAgcmV0dXJuIHNcbn1cblxuU2VsZWN0b3IucHJvdG90eXBlLnByZWZpeCA9IGZ1bmN0aW9uIChwcmUsIHNlcGFyYXRvcikge1xuICB2YXIgcyA9IHRoaXMuY2xvbmUoKVxuICB2YXIgc2VwID0gcy52YWx1ZSA/IHNlcGFyYXRvciB8fCBTZWxlY3Rvci5ERUZBVUxUX05FU1RfU0VQQVJBVE9SIDogXCJcIlxuICBzLnZhbHVlID0gcHJlICsgc2VwICsgcy52YWx1ZVxuICByZXR1cm4gc1xufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUubmVzdCA9IGZ1bmN0aW9uIChwb3N0LCBzZXBhcmF0b3IpIHtcbiAgdmFyIHMgPSB0aGlzLmNsb25lKClcbiAgdmFyIHNlcCA9IHMudmFsdWUgPyBzZXBhcmF0b3IgfHwgU2VsZWN0b3IuREVGQVVMVF9ORVNUX1NFUEFSQVRPUiA6IFwiXCJcbiAgcy52YWx1ZSArPSBzZXAgKyBwb3N0XG4gIHJldHVybiBzXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5mcm9tID0gZnVuY3Rpb24gKGVsZW1lbnQsIGV4Y2VwdCkge1xuICB2YXIgcyA9IHRoaXMuY2xvbmUoKVxuICBzLmVsZW1lbnQgPSBlbGVtZW50XG4gIGlmIChleGNlcHQpIHtcbiAgICBzLnVud2FudGVkUGFyZW50U2VsZWN0b3IgPSBleGNlcHQudG9TdHJpbmcoKVxuICB9XG4gIHJldHVybiBzXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5zZWxlY3QgPSBmdW5jdGlvbiAoZWxlbWVudCwgdHJhbnNmb3JtKSB7XG4gIHZhciByZXN1bHQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy50b1N0cmluZygpKVxuICBpZiAocmVzdWx0ICYmIHRoaXMudW53YW50ZWRQYXJlbnRTZWxlY3RvciAmJiB0aGlzLmVsZW1lbnQpIHtcbiAgICB2YXIgaXNXYW50ZWRDaGlsZCA9IHBhcmVudEZpbHRlcih0aGlzLnVud2FudGVkUGFyZW50U2VsZWN0b3IsIHRoaXMuZWxlbWVudClcbiAgICBpZiAoIWlzV2FudGVkQ2hpbGQocmVzdWx0KSkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxuICAgICAgPyB0cmFuc2Zvcm0gPyB0cmFuc2Zvcm0ocmVzdWx0KSA6IHJlc3VsdFxuICAgICAgOiBudWxsXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5zZWxlY3RBbGwgPSBmdW5jdGlvbiAoZWxlbWVudCwgdHJhbnNmb3JtKSB7XG4gIHZhciByZXN1bHQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy50b1N0cmluZygpKVxuICBpZiAodGhpcy51bndhbnRlZFBhcmVudFNlbGVjdG9yICYmIHRoaXMuZWxlbWVudCkge1xuICAgIHJlc3VsdCA9IFtdLmZpbHRlci5jYWxsKHJlc3VsdCwgcGFyZW50RmlsdGVyKHRoaXMudW53YW50ZWRQYXJlbnRTZWxlY3RvciwgdGhpcy5lbGVtZW50KSlcbiAgfVxuICByZXR1cm4gdHJhbnNmb3JtID8gW10ubWFwLmNhbGwocmVzdWx0LCB0cmFuc2Zvcm0pIDogW10uc2xpY2UuY2FsbChyZXN1bHQpXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5ub2RlID0gZnVuY3Rpb24gKHRyYW5zZm9ybSkge1xuICByZXR1cm4gdGhpcy5zZWxlY3QodGhpcy5lbGVtZW50LCB0cmFuc2Zvcm0pXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5ub2RlTGlzdCA9IGZ1bmN0aW9uICh0cmFuc2Zvcm0pIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0QWxsKHRoaXMuZWxlbWVudCwgdHJhbnNmb3JtKVxufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUuY29uc3RydWN0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzLkNvbnN0cnVjdG9yXG4gIHZhciBpbnN0YW50aWF0ZSA9IHRoaXMuaW5zdGFudGlhdGUgfHwgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gbmV3IENvbnN0cnVjdG9yKGVsZW1lbnQpXG4gIH1cbiAgaWYgKHRoaXMubXVsdGlwbGUpIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlTGlzdCgpLm1hcChpbnN0YW50aWF0ZSlcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlKGluc3RhbnRpYXRlKVxuICB9XG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5Db25zdHJ1Y3RvciB8fCB0aGlzLmluc3RhbnRpYXRlKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0KClcbiAgfVxuICBpZiAodGhpcy5tdWx0aXBsZSkge1xuICAgIHJldHVybiB0aGlzLm5vZGVMaXN0KClcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlKClcbiAgfVxufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzdHJpbmcgPSBcIlwiXG4gIHZhciB2YWx1ZSA9IHRoaXMudmFsdWVcbiAgdmFyIGF0dHJpYnV0ZSA9IHRoaXMuYXR0cmlidXRlXG4gIHZhciBleHRyYSA9IHRoaXMuZXh0cmEgfHwgXCJcIlxuXG4gIHN3aXRjaCAoYXR0cmlidXRlKSB7XG4gICAgY2FzZSBcImlkXCI6XG4gICAgICAgIHN0cmluZyA9IFwiI1wiICsgdmFsdWVcbiAgICAgIGJyZWFrXG4gICAgY2FzZSBcImNsYXNzXCI6XG4gICAgICBzdHJpbmcgPSBcIi5cIiArIHZhbHVlXG4gICAgICBicmVha1xuICAgIGNhc2UgXCJcIjpcbiAgICAgIHN0cmluZyA9IHZhbHVlIHx8IFwiXCJcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHZhbHVlID0gdmFsdWUgPT09IFwiXCIgfHwgdmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09IGZhbHNlIHx8IHZhbHVlID09IG51bGxcbiAgICAgICAgPyBcIlwiXG4gICAgICAgIDogJ1wiJyArIHZhbHVlICsgJ1wiJ1xuICAgICAgdmFyIG9wZXJhdG9yID0gdmFsdWUgPyB0aGlzLm9wZXJhdG9yIHx8IFwiPVwiIDogXCJcIlxuICAgICAgc3RyaW5nID0gXCJbXCIgKyBhdHRyaWJ1dGUgKyBvcGVyYXRvciArIHZhbHVlICsgXCJdXCJcbiAgfVxuXG4gIHN0cmluZyArPSBleHRyYVxuXG4gIHJldHVybiBzdHJpbmdcbn1cbiIsInZhciBpbmhlcml0ID0gcmVxdWlyZShcIm1hdGNoYm94LWZhY3RvcnkvaW5oZXJpdFwiKVxudmFyIERhdGEgPSByZXF1aXJlKFwiLi4vRGF0YVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb2xlYW5EYXRhXG5cbmZ1bmN0aW9uIEJvb2xlYW5EYXRhIChuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKSB7XG4gIERhdGEuY2FsbCh0aGlzLCBuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKVxufVxuXG5pbmhlcml0KEJvb2xlYW5EYXRhLCBEYXRhKVxuXG5Cb29sZWFuRGF0YS5wcm90b3R5cGUudHlwZSA9IFwiQm9vbGVhblwiXG5cbkJvb2xlYW5EYXRhLnByb3RvdHlwZS5jaGVja1R5cGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSBcImJvb2xlYW5cIlxufVxuXG5Cb29sZWFuRGF0YS5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBcInRydWVcIlxufVxuXG5Cb29sZWFuRGF0YS5wcm90b3R5cGUuc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiXG59XG4iLCJ2YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCJtYXRjaGJveC1mYWN0b3J5L2luaGVyaXRcIilcbnZhciBEYXRhID0gcmVxdWlyZShcIi4uL0RhdGFcIilcblxubW9kdWxlLmV4cG9ydHMgPSBGbG9hdERhdGFcblxuZnVuY3Rpb24gRmxvYXREYXRhIChuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKSB7XG4gIERhdGEuY2FsbCh0aGlzLCBuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKVxufVxuXG5pbmhlcml0KEZsb2F0RGF0YSwgRGF0YSlcblxuRmxvYXREYXRhLnByb3RvdHlwZS50eXBlID0gXCJmbG9hdFwiXG5cbkZsb2F0RGF0YS5wcm90b3R5cGUuY2hlY2tUeXBlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gXCJudW1iZXJcIlxufVxuXG5GbG9hdERhdGEucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKVxufVxuXG5GbG9hdERhdGEucHJvdG90eXBlLnN0cmluZ2lmeSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gXCJcIit2YWx1ZVxufVxuIiwidmFyIGluaGVyaXQgPSByZXF1aXJlKFwibWF0Y2hib3gtZmFjdG9yeS9pbmhlcml0XCIpXG52YXIgRGF0YSA9IHJlcXVpcmUoXCIuLi9EYXRhXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gSlNPTkRhdGFcblxuZnVuY3Rpb24gSlNPTkRhdGEgKG5hbWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpIHtcbiAgRGF0YS5jYWxsKHRoaXMsIG5hbWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpXG59XG5cbmluaGVyaXQoSlNPTkRhdGEsIERhdGEpXG5cbkpTT05EYXRhLnByb3RvdHlwZS50eXBlID0gXCJqc29uXCJcblxuSlNPTkRhdGEucHJvdG90eXBlLmNoZWNrVHlwZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbFxufVxuXG5KU09ORGF0YS5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUpXG59XG5cbkpTT05EYXRhLnByb3RvdHlwZS5zdHJpbmdpZnkgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKVxufVxuIiwidmFyIGluaGVyaXQgPSByZXF1aXJlKFwibWF0Y2hib3gtZmFjdG9yeS9pbmhlcml0XCIpXG52YXIgRGF0YSA9IHJlcXVpcmUoXCIuLi9EYXRhXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gTnVtYmVyRGF0YVxuXG5mdW5jdGlvbiBOdW1iZXJEYXRhIChuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKSB7XG4gIERhdGEuY2FsbCh0aGlzLCBuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKVxufVxuXG5pbmhlcml0KE51bWJlckRhdGEsIERhdGEpXG5cbk51bWJlckRhdGEucHJvdG90eXBlLnR5cGUgPSBcIm51bWJlclwiXG5cbk51bWJlckRhdGEucHJvdG90eXBlLmNoZWNrVHlwZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09IFwibnVtYmVyXCJcbn1cblxuTnVtYmVyRGF0YS5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHBhcnNlSW50KHZhbHVlLCAxMClcbn1cblxuTnVtYmVyRGF0YS5wcm90b3R5cGUuc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiBcIlwiK3ZhbHVlXG59XG4iLCJ2YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCJtYXRjaGJveC1mYWN0b3J5L2luaGVyaXRcIilcbnZhciBEYXRhID0gcmVxdWlyZShcIi4uL0RhdGFcIilcblxubW9kdWxlLmV4cG9ydHMgPSBTdHJpbmdEYXRhXG5cbmZ1bmN0aW9uIFN0cmluZ0RhdGEgKG5hbWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpIHtcbiAgRGF0YS5jYWxsKHRoaXMsIG5hbWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpXG59XG5cbmluaGVyaXQoU3RyaW5nRGF0YSwgRGF0YSlcblxuU3RyaW5nRGF0YS5wcm90b3R5cGUudHlwZSA9IFwic3RyaW5nXCJcblxuU3RyaW5nRGF0YS5wcm90b3R5cGUuY2hlY2tUeXBlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gXCJzdHJpbmdcIlxufVxuXG5TdHJpbmdEYXRhLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPyBcIlwiK3ZhbHVlIDogXCJcIlxufVxuXG5TdHJpbmdEYXRhLnByb3RvdHlwZS5zdHJpbmdpZnkgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID8gXCJcIit2YWx1ZSA6IFwiXCJcbn1cbiIsInZhciBkYXRhID0gbW9kdWxlLmV4cG9ydHMgPSB7fVxuXG5kYXRhLkJvb2xlYW4gPSByZXF1aXJlKFwiLi9Cb29sZWFuRGF0YVwiKVxuZGF0YS5TdHJpbmcgPSByZXF1aXJlKFwiLi9TdHJpbmdEYXRhXCIpXG5kYXRhLk51bWJlciA9IHJlcXVpcmUoXCIuL051bWJlckRhdGFcIilcbmRhdGEuRmxvYXQgPSByZXF1aXJlKFwiLi9GbG9hdERhdGFcIilcbmRhdGEuSlNPTiA9IHJlcXVpcmUoXCIuL0pTT05EYXRhXCIpXG5cbmRhdGEuY3JlYXRlID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlLCBvbkNoYW5nZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZVxuXG4gIHN3aXRjaCh0eXBlKSB7XG4gICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICAgIHJldHVybiBuZXcgZGF0YS5Cb29sZWFuKG5hbWUsIHZhbHVlLCBvbkNoYW5nZSlcbiAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICByZXR1cm4gbmV3IGRhdGEuU3RyaW5nKG5hbWUsIHZhbHVlLCBvbkNoYW5nZSlcbiAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICAvLyBub3RlOiBpdCBmYWlscyBmb3IgMS4wXG4gICAgICBpZiAodmFsdWUgPT09ICt2YWx1ZSAmJiB2YWx1ZSAhPT0gKHZhbHVlIHwgMCkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBkYXRhLkZsb2F0KG5hbWUsIHZhbHVlLCBvbkNoYW5nZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgZGF0YS5OdW1iZXIobmFtZSwgdmFsdWUsIG9uQ2hhbmdlKVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbmV3IGRhdGEuSlNPTihuYW1lLCB2YWx1ZSwgb25DaGFuZ2UpXG4gIH1cbn1cbiIsInZhciBTZWxlY3RvciA9IHJlcXVpcmUoXCIuLi9TZWxlY3RvclwiKVxuXG4vKipcbiAqIFJlZ2lzdGVycyBhbiBldmVudCBsaXN0ZW5lciBvbiBhbiBlbGVtZW50XG4gKiBhbmQgcmV0dXJucyBhIGRlbGVnYXRvci5cbiAqIEEgZGVsZWdhdGVkIGV2ZW50IHJ1bnMgbWF0Y2hlcyB0byBmaW5kIGFuIGV2ZW50IHRhcmdldCxcbiAqIHRoZW4gZXhlY3V0ZXMgdGhlIGhhbmRsZXIgcGFpcmVkIHdpdGggdGhlIG1hdGNoZXIuXG4gKiBNYXRjaGVycyBjYW4gY2hlY2sgaWYgYW4gZXZlbnQgdGFyZ2V0IG1hdGNoZXMgYSBnaXZlbiBzZWxlY3RvcixcbiAqIG9yIHNlZSBpZiBhbiBvZiBpdHMgcGFyZW50cyBkby5cbiAqICovXG5tb2R1bGUuZXhwb3J0cyA9IGRlbGVnYXRlXG5cbmZ1bmN0aW9uIGRlbGVnYXRlKCBvcHRpb25zICl7XG4gIHZhciBlbGVtZW50ID0gb3B0aW9ucy5lbGVtZW50XG4gICAgLCBldmVudCA9IG9wdGlvbnMuZXZlbnRcbiAgICAsIGNhcHR1cmUgPSAhIW9wdGlvbnMuY2FwdHVyZSB8fCBmYWxzZVxuICAgICwgY29udGV4dCA9IG9wdGlvbnMuY29udGV4dCB8fCBlbGVtZW50XG4gICAgLCB0cmFuc2Zvcm0gPSBvcHRpb25zLnRyYW5zZm9ybSB8fCBudWxsXG5cbiAgaWYoICFlbGVtZW50ICl7XG4gICAgY29uc29sZS5sb2coXCJDYW4ndCBkZWxlZ2F0ZSB1bmRlZmluZWQgZWxlbWVudFwiKVxuICAgIHJldHVybiBudWxsXG4gIH1cbiAgaWYoICFldmVudCApe1xuICAgIGNvbnNvbGUubG9nKFwiQ2FuJ3QgZGVsZWdhdGUgdW5kZWZpbmVkIGV2ZW50XCIpXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHZhciBoYW5kbGVyID0gY3JlYXRlSGFuZGxlcihjb250ZXh0LCB0cmFuc2Zvcm0pXG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlciwgY2FwdHVyZSlcblxuICByZXR1cm4gaGFuZGxlclxufVxuXG4vKipcbiAqIFJldHVybnMgYSBkZWxlZ2F0b3IgdGhhdCBjYW4gYmUgdXNlZCBhcyBhbiBldmVudCBsaXN0ZW5lci5cbiAqIFRoZSBkZWxlZ2F0b3IgaGFzIHN0YXRpYyBtZXRob2RzIHdoaWNoIGNhbiBiZSB1c2VkIHRvIHJlZ2lzdGVyIGhhbmRsZXJzLlxuICogKi9cbmZ1bmN0aW9uIGNyZWF0ZUhhbmRsZXIoIGNvbnRleHQsIHRyYW5zZm9ybSApe1xuICB2YXIgbWF0Y2hlcnMgPSBbXVxuXG4gIGZ1bmN0aW9uIGRlbGVnYXRlZEhhbmRsZXIoIGUgKXtcbiAgICB2YXIgbCA9IG1hdGNoZXJzLmxlbmd0aFxuICAgIGlmKCAhbCApe1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICB2YXIgZWwgPSB0aGlzXG4gICAgICAgICwgaSA9IC0xXG4gICAgICAgICwgaGFuZGxlclxuICAgICAgICAsIHNlbGVjdG9yXG4gICAgICAgICwgZGVsZWdhdGVFbGVtZW50XG4gICAgICAgICwgc3RvcFByb3BhZ2F0aW9uXG4gICAgICAgICwgYXJnc1xuXG4gICAgd2hpbGUoICsraSA8IGwgKXtcbiAgICAgIGFyZ3MgPSBtYXRjaGVyc1tpXVxuICAgICAgaGFuZGxlciA9IGFyZ3NbMF1cbiAgICAgIHNlbGVjdG9yID0gYXJnc1sxXVxuXG4gICAgICBkZWxlZ2F0ZUVsZW1lbnQgPSBtYXRjaENhcHR1cmVQYXRoKHNlbGVjdG9yLCBlbCwgZSwgdHJhbnNmb3JtLCBjb250ZXh0KVxuICAgICAgaWYoIGRlbGVnYXRlRWxlbWVudCAmJiBkZWxlZ2F0ZUVsZW1lbnQubGVuZ3RoICkge1xuICAgICAgICBzdG9wUHJvcGFnYXRpb24gPSBmYWxzZSA9PT0gaGFuZGxlci5hcHBseShjb250ZXh0LCBbZV0uY29uY2F0KGRlbGVnYXRlRWxlbWVudCkpXG4gICAgICAgIGlmKCBzdG9wUHJvcGFnYXRpb24gKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGhhbmRsZXIgd2l0aCBhIHRhcmdldCBmaW5kZXIgbG9naWNcbiAgICogKi9cbiAgZGVsZWdhdGVkSGFuZGxlci5tYXRjaCA9IGZ1bmN0aW9uKCBzZWxlY3RvciwgaGFuZGxlciApe1xuICAgIG1hdGNoZXJzLnB1c2goW2hhbmRsZXIsIHNlbGVjdG9yXSlcbiAgICByZXR1cm4gZGVsZWdhdGVkSGFuZGxlclxuICB9XG5cbiAgcmV0dXJuIGRlbGVnYXRlZEhhbmRsZXJcbn1cblxuZnVuY3Rpb24gbWF0Y2hDYXB0dXJlUGF0aCggc2VsZWN0b3IsIGVsLCBlLCB0cmFuc2Zvcm0sIGNvbnRleHQgKXtcbiAgdmFyIGRlbGVnYXRlRWxlbWVudHMgPSBbXVxuICB2YXIgZGVsZWdhdGVFbGVtZW50ID0gbnVsbFxuICBpZiggQXJyYXkuaXNBcnJheShzZWxlY3RvcikgKXtcbiAgICB2YXIgaSA9IC0xXG4gICAgdmFyIGwgPSBzZWxlY3Rvci5sZW5ndGhcbiAgICB3aGlsZSggKytpIDwgbCApe1xuICAgICAgZGVsZWdhdGVFbGVtZW50ID0gZmluZFBhcmVudChzZWxlY3RvcltpXSwgZWwsIGUpXG4gICAgICBpZiggIWRlbGVnYXRlRWxlbWVudCApIHJldHVybiBudWxsXG4gICAgICBpZiAodHlwZW9mIHRyYW5zZm9ybSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgZGVsZWdhdGVFbGVtZW50ID0gdHJhbnNmb3JtKGNvbnRleHQsIHNlbGVjdG9yW2ldLCBkZWxlZ2F0ZUVsZW1lbnQpXG4gICAgICB9XG4gICAgICBkZWxlZ2F0ZUVsZW1lbnRzLnB1c2goZGVsZWdhdGVFbGVtZW50KVxuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBkZWxlZ2F0ZUVsZW1lbnQgPSBmaW5kUGFyZW50KHNlbGVjdG9yLCBlbCwgZSlcbiAgICBpZiggIWRlbGVnYXRlRWxlbWVudCApIHJldHVybiBudWxsXG4gICAgaWYgKHR5cGVvZiB0cmFuc2Zvcm0gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBkZWxlZ2F0ZUVsZW1lbnQgPSB0cmFuc2Zvcm0oY29udGV4dCwgc2VsZWN0b3IsIGRlbGVnYXRlRWxlbWVudClcbiAgICB9XG4gICAgZGVsZWdhdGVFbGVtZW50cy5wdXNoKGRlbGVnYXRlRWxlbWVudClcbiAgfVxuICByZXR1cm4gZGVsZWdhdGVFbGVtZW50c1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSB0YXJnZXQgb3IgYW55IG9mIGl0cyBwYXJlbnQgbWF0Y2hlcyBhIHNlbGVjdG9yXG4gKiAqL1xuZnVuY3Rpb24gZmluZFBhcmVudCggc2VsZWN0b3IsIGVsLCBlICl7XG4gIHZhciB0YXJnZXQgPSBlLnRhcmdldFxuICBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBTZWxlY3Rvcikge1xuICAgIHNlbGVjdG9yID0gc2VsZWN0b3IudG9TdHJpbmcoKVxuICB9XG4gIHN3aXRjaCggdHlwZW9mIHNlbGVjdG9yICl7XG4gICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgd2hpbGUoIHRhcmdldCAmJiB0YXJnZXQgIT0gZWwgKXtcbiAgICAgICAgaWYoIHRhcmdldC5tYXRjaGVzICYmIHRhcmdldC5tYXRjaGVzKHNlbGVjdG9yKSApIHJldHVybiB0YXJnZXRcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGVcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICB3aGlsZSggdGFyZ2V0ICYmIHRhcmdldCAhPSBlbCApe1xuICAgICAgICBpZiggc2VsZWN0b3IuY2FsbChlbCwgdGFyZ2V0KSApIHJldHVybiB0YXJnZXRcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGVcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsXG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdCAoQ2xhc3MsIEJhc2UpIHtcbiAgQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSlcbiAgQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2xhc3NcblxuICByZXR1cm4gQ2xhc3Ncbn1cbiIsInZhciBGYWN0b3J5ID0gcmVxdWlyZShcIi4vc3JjL0ZhY3RvcnlcIilcblxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5XG5cbmZhY3RvcnkuQ2FjaGVFeHRlbnNpb24gPSByZXF1aXJlKFwiLi9zcmMvQ2FjaGVFeHRlbnNpb25cIilcbmZhY3RvcnkuSW5zdGFuY2VFeHRlbnNpb24gPSByZXF1aXJlKFwiLi9zcmMvSW5zdGFuY2VFeHRlbnNpb25cIilcbmZhY3RvcnkuUHJvdG90eXBlRXh0ZW5zaW9uID0gcmVxdWlyZShcIi4vc3JjL1Byb3RvdHlwZUV4dGVuc2lvblwiKVxuXG5mdW5jdGlvbiBmYWN0b3J5KCBibHVlcHJpbnQgKXtcbiAgcmV0dXJuIG5ldyBGYWN0b3J5KGJsdWVwcmludCkuYXNzZW1ibGUoKVxufVxuIiwidmFyIG1lcmdlID0gcmVxdWlyZShcImJhY2t5YXJkL29iamVjdC9tZXJnZVwiKVxudmFyIGZvckluID0gcmVxdWlyZShcImJhY2t5YXJkL29iamVjdC9pblwiKVxuXG52YXIgRXh0ZW5zaW9uID0gcmVxdWlyZShcIi4vRXh0ZW5zaW9uXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gQmx1ZXByaW50XG5cbmZ1bmN0aW9uIEJsdWVwcmludChibG9ja3MsIHBhcmVudCkge1xuICB2YXIgYmx1ZXByaW50ID0gdGhpc1xuXG4gIHRoaXMuYmxvY2tzID0gbWVyZ2UoYmxvY2tzKVxuICB0aGlzLnBhcmVudCA9IHBhcmVudFxuXG4gIHRoaXMubG9jYWxFeHRlbnNpb25zID0gdGhpcy5nZXQoXCJleHRlbnNpb25zXCIsIHt9KVxuXG4gIGZvckluKHRoaXMubG9jYWxFeHRlbnNpb25zLCBmdW5jdGlvbihuYW1lLCBleHRlbnNpb24pIHtcbiAgICBleHRlbnNpb24gPSBleHRlbnNpb24gaW5zdGFuY2VvZiBFeHRlbnNpb25cbiAgICAgICAgPyBleHRlbnNpb25cbiAgICAgICAgOiBuZXcgRXh0ZW5zaW9uKGV4dGVuc2lvbilcbiAgICBibHVlcHJpbnQubG9jYWxFeHRlbnNpb25zW25hbWVdID0gZXh0ZW5zaW9uXG4gICAgZXh0ZW5zaW9uLm5hbWUgPSBuYW1lXG4gIH0pXG5cbiAgdGhpcy5nbG9iYWxFeHRlbnNpb25zID0gdGhpcy5sb2NhbEV4dGVuc2lvbnNcblxuICBpZiAocGFyZW50KSB7XG4gICAgdGhpcy5nbG9iYWxFeHRlbnNpb25zID0gbWVyZ2UocGFyZW50Lmdsb2JhbEV4dGVuc2lvbnMsIHRoaXMubG9jYWxFeHRlbnNpb25zKVxuICAgIGZvckluKHRoaXMuZ2xvYmFsRXh0ZW5zaW9ucywgZnVuY3Rpb24obmFtZSwgZXh0ZW5zaW9uKSB7XG4gICAgICBpZiAoZXh0ZW5zaW9uLmluaGVyaXQpIHtcbiAgICAgICAgYmx1ZXByaW50LmJsb2Nrc1tuYW1lXSA9IG1lcmdlKHBhcmVudC5nZXQobmFtZSksIGJsdWVwcmludC5nZXQobmFtZSkpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5CbHVlcHJpbnQucHJvdG90eXBlLmJ1aWxkUHJvdG90eXBlID0gZnVuY3Rpb24ocHJvdG90eXBlLCB0b3ApIHtcbiAgdGhpcy5idWlsZChcInByb3RvdHlwZVwiLCB0aGlzLmdsb2JhbEV4dGVuc2lvbnMsIHRvcCwgZnVuY3Rpb24obmFtZSwgZXh0ZW5zaW9uLCBibG9jaykge1xuICAgIGlmIChleHRlbnNpb24ubG9vcCkge1xuICAgICAgZm9ySW4oYmxvY2ssIGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIGV4dGVuc2lvbi5pbml0aWFsaXplKHByb3RvdHlwZSwgbmFtZSwgdmFsdWUpXG4gICAgICB9KVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGV4dGVuc2lvbi5pbml0aWFsaXplKHByb3RvdHlwZSwgbmFtZSwgYmxvY2spXG4gICAgfVxuICB9KVxufVxuXG5CbHVlcHJpbnQucHJvdG90eXBlLmJ1aWxkQ2FjaGUgPSBmdW5jdGlvbihwcm90b3R5cGUsIHRvcCkge1xuICB0aGlzLmJ1aWxkKFwiY2FjaGVcIiwgdGhpcy5nbG9iYWxFeHRlbnNpb25zLCB0b3AsIGZ1bmN0aW9uKG5hbWUsIGV4dGVuc2lvbiwgYmxvY2spIHtcbiAgICBpZiAoIXByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgcHJvdG90eXBlW25hbWVdID0ge31cbiAgICB9XG5cbiAgICB2YXIgY2FjaGUgPSBwcm90b3R5cGVbbmFtZV1cbiAgICB2YXIgaW5pdGlhbGl6ZSA9IGV4dGVuc2lvbi5pbml0aWFsaXplXG5cbiAgICBpZiAoZXh0ZW5zaW9uLmxvb3ApIHtcbiAgICAgIGZvckluKGJsb2NrLCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgICBjYWNoZVtuYW1lXSA9IGluaXRpYWxpemVcbiAgICAgICAgICAgID8gaW5pdGlhbGl6ZShwcm90b3R5cGUsIG5hbWUsIHZhbHVlKVxuICAgICAgICAgICAgOiB2YWx1ZVxuICAgICAgfSlcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjYWNoZVtuYW1lXSA9IGluaXRpYWxpemVcbiAgICAgICAgICA/IGluaXRpYWxpemUocHJvdG90eXBlLCBuYW1lLCBibG9jaylcbiAgICAgICAgICA6IGJsb2NrXG4gICAgfVxuICB9KVxufVxuXG5CbHVlcHJpbnQucHJvdG90eXBlLmJ1aWxkSW5zdGFuY2UgPSBmdW5jdGlvbihpbnN0YW5jZSwgdG9wKSB7XG4gIHRoaXMuYnVpbGQoXCJpbnN0YW5jZVwiLCB0aGlzLmxvY2FsRXh0ZW5zaW9ucywgdG9wLCBmdW5jdGlvbihuYW1lLCBleHRlbnNpb24sIGJsb2NrKSB7XG4gICAgaWYgKGV4dGVuc2lvbi5sb29wKSB7XG4gICAgICBmb3JJbihibG9jaywgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICAgICAgZXh0ZW5zaW9uLmluaXRpYWxpemUoaW5zdGFuY2UsIG5hbWUsIHZhbHVlKVxuICAgICAgfSlcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBleHRlbnNpb24uaW5pdGlhbGl6ZShpbnN0YW5jZSwgbmFtZSwgYmxvY2spXG4gICAgfVxuICB9KVxufVxuXG5CbHVlcHJpbnQucHJvdG90eXBlLmJ1aWxkID0gZnVuY3Rpb24odHlwZSwgZXh0ZW5zaW9ucywgdG9wLCBidWlsZCkge1xuICB2YXIgYmx1ZXByaW50ID0gdG9wIHx8IHRoaXNcbiAgZm9ySW4oZXh0ZW5zaW9ucywgZnVuY3Rpb24obmFtZSwgZXh0ZW5zaW9uKSB7XG4gICAgaWYgKGV4dGVuc2lvbi50eXBlICE9IHR5cGUpIHJldHVyblxuICAgIHZhciBibG9jayA9IGJsdWVwcmludC5nZXQobmFtZSlcbiAgICBpZiAoIWJsb2NrKSByZXR1cm5cblxuICAgIGJ1aWxkKG5hbWUsIGV4dGVuc2lvbiwgYmxvY2spXG4gIH0pXG59XG5cbkJsdWVwcmludC5wcm90b3R5cGUuZGlnZXN0ID0gZnVuY3Rpb24obmFtZSwgZm4sIGxvb3ApIHtcbiAgaWYgKHRoaXMuaGFzKG5hbWUpKSB7XG4gICAgdmFyIGJsb2NrID0gdGhpcy5nZXQobmFtZSlcbiAgICBpZiAobG9vcCkge1xuICAgICAgZm9ySW4oYmxvY2ssIGZuKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGZuLmNhbGwodGhpcywgYmxvY2spXG4gICAgfVxuICB9XG59XG5cbkJsdWVwcmludC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gdGhpcy5ibG9ja3MuaGFzT3duUHJvcGVydHkobmFtZSkgJiYgdGhpcy5ibG9ja3NbbmFtZV0gIT0gbnVsbFxufVxuXG5CbHVlcHJpbnQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUsIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAodGhpcy5oYXMobmFtZSkpIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja3NbbmFtZV1cbiAgfVxuICByZXR1cm4gZGVmYXVsdFZhbHVlXG59XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZShcImJhY2t5YXJkL29iamVjdC9leHRlbmRcIilcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoXCJiYWNreWFyZC9vYmplY3QvZGVmYXVsdHNcIilcbnZhciBpbmhlcml0ID0gcmVxdWlyZShcImJhY2t5YXJkL2Z1bmN0aW9uL2luaGVyaXRcIilcblxudmFyIEV4dGVuc2lvbiA9IHJlcXVpcmUoXCIuL0V4dGVuc2lvblwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhY2hlRXh0ZW5zaW9uXG5cbmZ1bmN0aW9uIENhY2hlRXh0ZW5zaW9uKG9wdGlvbnMsIGluaXRpYWxpemUpIHtcbiAgaWYgKCFpbml0aWFsaXplKSB7XG4gICAgaW5pdGlhbGl6ZSA9IG9wdGlvbnNcbiAgICBvcHRpb25zID0ge31cbiAgfVxuICBvcHRpb25zID0gZGVmYXVsdHMob3B0aW9ucywge1xuICAgIGxvb3A6IHRydWVcbiAgfSlcbiAgZXh0ZW5kKG9wdGlvbnMsIHtcbiAgICB0eXBlOiBcImNhY2hlXCIsXG4gICAgaW5oZXJpdDogdHJ1ZSxcbiAgICBpbml0aWFsaXplOiBpbml0aWFsaXplXG4gIH0pXG4gIEV4dGVuc2lvbi5jYWxsKHRoaXMsIG9wdGlvbnMpXG59XG5cbmluaGVyaXQoQ2FjaGVFeHRlbnNpb24sIEV4dGVuc2lvbilcbiIsIm1vZHVsZS5leHBvcnRzID0gRXh0ZW5zaW9uXG5cbmZ1bmN0aW9uIEV4dGVuc2lvbihleHRlbnNpb24pIHtcbiAgZXh0ZW5zaW9uID0gZXh0ZW5zaW9uIHx8IHt9XG4gIHRoaXMubmFtZSA9IFwiXCJcbiAgdGhpcy50eXBlID0gZXh0ZW5zaW9uLnR5cGUgfHwgXCJpbnN0YW5jZVwiXG4gIHRoaXMuaW5oZXJpdCA9IGV4dGVuc2lvbi5pbmhlcml0IHx8IGZhbHNlXG4gIHRoaXMuaW5pdGlhbGl6ZSA9IGV4dGVuc2lvbi5pbml0aWFsaXplIHx8IG51bGxcbiAgdGhpcy5sb29wID0gZXh0ZW5zaW9uLmxvb3AgPT0gbnVsbCA/IHRydWUgOiBleHRlbnNpb24ubG9vcFxufVxuIiwidmFyIGRlZmluZSA9IHJlcXVpcmUoXCJiYWNreWFyZC9vYmplY3QvZGVmaW5lXCIpXG52YXIgZXh0ZW5kT2JqZWN0ID0gcmVxdWlyZShcImJhY2t5YXJkL29iamVjdC9leHRlbmRcIilcbnZhciBleHRlbmRQcm90b3R5cGUgPSByZXF1aXJlKFwiYmFja3lhcmQvZnVuY3Rpb24vZXh0ZW5kXCIpXG52YXIgYXVnbWVudCA9IHJlcXVpcmUoXCJiYWNreWFyZC9mdW5jdGlvbi9hdWdtZW50XCIpXG52YXIgaW5jbHVkZSA9IHJlcXVpcmUoXCJiYWNreWFyZC9mdW5jdGlvbi9pbmNsdWRlXCIpXG52YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCJiYWNreWFyZC9mdW5jdGlvbi9pbmhlcml0XCIpXG5cbnZhciBCbHVlcHJpbnQgPSByZXF1aXJlKFwiLi9CbHVlcHJpbnRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBGYWN0b3J5XG5cbmZ1bmN0aW9uIEZhY3RvcnkoYmx1ZXByaW50LCBwYXJlbnQpIHtcbiAgdmFyIGZhY3RvcnkgPSB0aGlzXG5cbiAgaWYgKCEoYmx1ZXByaW50IGluc3RhbmNlb2YgQmx1ZXByaW50KSkge1xuICAgIGJsdWVwcmludCA9IG5ldyBCbHVlcHJpbnQoYmx1ZXByaW50LCBwYXJlbnQgPyBwYXJlbnQuYmx1ZXByaW50IDogbnVsbClcbiAgfVxuXG4gIHRoaXMuYmx1ZXByaW50ID0gYmx1ZXByaW50XG4gIHRoaXMucGFyZW50ID0gcGFyZW50IHx8IG51bGxcbiAgdGhpcy5hbmNlc3RvcnMgPSBwYXJlbnQgPyBwYXJlbnQuYW5jZXN0b3JzLmNvbmNhdChbcGFyZW50XSkgOiBbXVxuICB0aGlzLnJvb3QgPSB0aGlzLmFuY2VzdG9yc1swXSB8fCBudWxsXG4gIHRoaXMuU3VwZXIgPSBibHVlcHJpbnQuZ2V0KFwiaW5oZXJpdFwiLCBudWxsKVxuICB0aGlzLkNvbnN0cnVjdG9yID0gYmx1ZXByaW50LmdldChcImNvbnN0cnVjdG9yXCIsIGZ1bmN0aW9uKCkge1xuICAgIGlmIChmYWN0b3J5LlN1cGVyKSB7XG4gICAgICBmYWN0b3J5LlN1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICB9XG4gICAgdGhpcy5jb25zdHJ1Y3Rvci5pbml0aWFsaXplKHRoaXMpXG4gIH0pXG4gIHRoaXMuQ29uc3RydWN0b3IuZXh0ZW5kID0gZnVuY3Rpb24oc3VwZXJCbHVlcHJpbnQpIHtcbiAgICBzdXBlckJsdWVwcmludCA9IHN1cGVyQmx1ZXByaW50IHx8IHt9XG4gICAgc3VwZXJCbHVlcHJpbnRbXCJpbmhlcml0XCJdID0gZmFjdG9yeS5Db25zdHJ1Y3RvclxuICAgIHZhciBzdXBlckZhY3RvcnkgPSBuZXcgRmFjdG9yeShzdXBlckJsdWVwcmludCwgZmFjdG9yeSlcbiAgICByZXR1cm4gc3VwZXJGYWN0b3J5LmFzc2VtYmxlKClcbiAgfVxuXG4gIHRoaXMuaW5kdXN0cnkucHVzaCh0aGlzKVxufVxuXG5GYWN0b3J5LnByb3RvdHlwZS5hc3NlbWJsZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYmx1ZXByaW50ID0gdGhpcy5ibHVlcHJpbnRcbiAgdmFyIENvbnN0cnVjdG9yID0gdGhpcy5Db25zdHJ1Y3RvclxuXG4gIENvbnN0cnVjdG9yLlN1cGVyID0gdGhpcy5TdXBlclxuICBDb25zdHJ1Y3Rvci5ibHVlcHJpbnQgPSBibHVlcHJpbnRcblxuICB0aGlzLmRpZ2VzdCgpXG5cbiAgYmx1ZXByaW50LmJ1aWxkUHJvdG90eXBlKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgYmx1ZXByaW50KVxuICBibHVlcHJpbnQuYnVpbGRDYWNoZShDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIGJsdWVwcmludClcblxuICBDb25zdHJ1Y3Rvci5pbml0aWFsaXplID0gZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgICB2YXIgdG9wID0gaW5zdGFuY2UuY29uc3RydWN0b3IuYmx1ZXByaW50XG4gICAgYmx1ZXByaW50LmJ1aWxkSW5zdGFuY2UoaW5zdGFuY2UsIHRvcClcbiAgfVxuXG4gIHJldHVybiBDb25zdHJ1Y3RvclxufVxuXG5GYWN0b3J5LnByb3RvdHlwZS5kaWdlc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGJsdWVwcmludCA9IHRoaXMuYmx1ZXByaW50XG4gIHZhciBDb25zdHJ1Y3RvciA9IHRoaXMuQ29uc3RydWN0b3JcbiAgdmFyIHByb3RvID0gQ29uc3RydWN0b3IucHJvdG90eXBlXG5cbiAgYmx1ZXByaW50LmRpZ2VzdChcImluaGVyaXRcIiwgZnVuY3Rpb24oU3VwZXIpIHtcbiAgICBpbmhlcml0KENvbnN0cnVjdG9yLCBTdXBlcilcbiAgfSlcbiAgYmx1ZXByaW50LmRpZ2VzdChcImluY2x1ZGVcIiwgZnVuY3Rpb24oaW5jbHVkZXMpIHtcbiAgICBpbmNsdWRlKENvbnN0cnVjdG9yLCBpbmNsdWRlcylcbiAgfSlcbiAgYmx1ZXByaW50LmRpZ2VzdChcImF1Z21lbnRcIiwgZnVuY3Rpb24oYXVnbWVudHMpIHtcbiAgICBhdWdtZW50KENvbnN0cnVjdG9yLCBhdWdtZW50cylcbiAgfSlcbiAgYmx1ZXByaW50LmRpZ2VzdChcInByb3RvdHlwZVwiLCBmdW5jdGlvbihwcm90b3R5cGUpIHtcbiAgICBleHRlbmRQcm90b3R5cGUoQ29uc3RydWN0b3IsIHByb3RvdHlwZSlcbiAgfSlcbiAgaWYgKGJsdWVwcmludC5wYXJlbnQpIHtcbiAgICBleHRlbmRPYmplY3QoQ29uc3RydWN0b3IsIGJsdWVwcmludC5wYXJlbnQuZ2V0KFwic3RhdGljXCIpKVxuICB9XG4gIGJsdWVwcmludC5kaWdlc3QoXCJzdGF0aWNcIiwgZnVuY3Rpb24obWV0aG9kcykge1xuICAgIGV4dGVuZE9iamVjdChDb25zdHJ1Y3RvciwgbWV0aG9kcylcbiAgfSlcbiAgYmx1ZXByaW50LmRpZ2VzdChcImFjY2Vzc29yXCIsIGZ1bmN0aW9uKG5hbWUsIGFjY2Vzcykge1xuICAgIGlmICghYWNjZXNzKSByZXR1cm5cbiAgICBpZiAodHlwZW9mIGFjY2VzcyA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGRlZmluZS5nZXR0ZXIocHJvdG8sIG5hbWUsIGFjY2VzcylcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGFjY2Vzc1tcImdldFwiXSA9PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIGFjY2Vzc1tcInNldFwiXSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGRlZmluZS5hY2Nlc3Nvcihwcm90bywgbmFtZSwgYWNjZXNzW1wiZ2V0XCJdLCBhY2Nlc3NbXCJzZXRcIl0pXG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBhY2Nlc3NbXCJnZXRcIl0gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBkZWZpbmUuZ2V0dGVyKHByb3RvLCBuYW1lLCBhY2Nlc3NbXCJnZXRcIl0pXG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBhY2Nlc3NbXCJzZXRcIl0gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBkZWZpbmUuZ2V0dGVyKHByb3RvLCBuYW1lLCBhY2Nlc3NbXCJzZXRcIl0pXG4gICAgfVxuICB9LCB0cnVlKVxuICAvL2JsdWVwcmludC5kaWdlc3QoXCJpbmNsdWRlXCIsIGZ1bmN0aW9uIChpbmNsdWRlcykge1xuICAvLyAgaWYgKCFBcnJheS5pc0FycmF5KGluY2x1ZGVzKSkge1xuICAvLyAgICBpbmNsdWRlcyA9IFtpbmNsdWRlc11cbiAgLy8gIH1cbiAgLy8gIGluY2x1ZGVzLmZvckVhY2goZnVuY3Rpb24gKGluY2x1ZGUpIHtcbiAgLy8gICAgdmFyIGZvcmVpZ24gPSBmYWN0b3J5LmZpbmRGYWN0b3J5KGluY2x1ZGUpXG4gIC8vICAgIGlmIChmb3JlaWduKSB7XG4gIC8vICAgICAgZm9yZWlnbi5ibHVlcHJpbnQuYnVpbGQoXCJwcm90b3R5cGVcIiwgQ29uc3RydWN0b3IucHJvdG90eXBlLCBibHVlcHJpbnQpXG4gIC8vICAgIH1cbiAgLy8gIH0pXG4gIC8vfSlcbn1cblxuRmFjdG9yeS5wcm90b3R5cGUuaW5kdXN0cnkgPSBbXVxuXG4vL0ZhY3RvcnkucHJvdG90eXBlLmZpbmRGYWN0b3J5ID0gZnVuY3Rpb24oQ29uc3RydWN0b3IpIHtcbi8vICB2YXIgcmV0ID0gbnVsbFxuLy8gIHRoaXMuaW5kdXN0cnkuc29tZShmdW5jdGlvbihmYWN0b3J5KSB7XG4vLyAgICByZXR1cm4gZmFjdG9yeS5Db25zdHJ1Y3RvciA9PT0gQ29uc3RydWN0b3IgJiYgKHJldCA9IGZhY3RvcnkpXG4vLyAgfSlcbi8vICByZXR1cm4gcmV0XG4vL31cbiIsInZhciBleHRlbmQgPSByZXF1aXJlKFwiYmFja3lhcmQvb2JqZWN0L2V4dGVuZFwiKVxudmFyIGRlZmF1bHRzID0gcmVxdWlyZShcImJhY2t5YXJkL29iamVjdC9kZWZhdWx0c1wiKVxudmFyIGluaGVyaXQgPSByZXF1aXJlKFwiYmFja3lhcmQvZnVuY3Rpb24vaW5oZXJpdFwiKVxuXG52YXIgRXh0ZW5zaW9uID0gcmVxdWlyZShcIi4vRXh0ZW5zaW9uXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdGFuY2VFeHRlbnNpb25cblxuZnVuY3Rpb24gSW5zdGFuY2VFeHRlbnNpb24ob3B0aW9ucywgaW5pdGlhbGl6ZSkge1xuICBpZiAoIWluaXRpYWxpemUpIHtcbiAgICBpbml0aWFsaXplID0gb3B0aW9uc1xuICAgIG9wdGlvbnMgPSB7fVxuICB9XG4gIG9wdGlvbnMgPSBkZWZhdWx0cyhvcHRpb25zLCB7XG4gICAgbG9vcDogdHJ1ZVxuICB9KVxuICBleHRlbmQob3B0aW9ucywge1xuICAgIHR5cGU6IFwiaW5zdGFuY2VcIixcbiAgICBpbmhlcml0OiB0cnVlLFxuICAgIGluaXRpYWxpemU6IGluaXRpYWxpemVcbiAgfSlcbiAgRXh0ZW5zaW9uLmNhbGwodGhpcywgb3B0aW9ucylcbn1cblxuaW5oZXJpdChJbnN0YW5jZUV4dGVuc2lvbiwgRXh0ZW5zaW9uKVxuIiwidmFyIGV4dGVuZCA9IHJlcXVpcmUoXCJiYWNreWFyZC9vYmplY3QvZXh0ZW5kXCIpXG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKFwiYmFja3lhcmQvb2JqZWN0L2RlZmF1bHRzXCIpXG52YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCJiYWNreWFyZC9mdW5jdGlvbi9pbmhlcml0XCIpXG5cbnZhciBFeHRlbnNpb24gPSByZXF1aXJlKFwiLi9FeHRlbnNpb25cIilcblxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVFeHRlbnNpb25cblxuZnVuY3Rpb24gUHJvdG90eXBlRXh0ZW5zaW9uKG9wdGlvbnMsIGluaXRpYWxpemUpIHtcbiAgaWYgKCFpbml0aWFsaXplKSB7XG4gICAgaW5pdGlhbGl6ZSA9IG9wdGlvbnNcbiAgICBvcHRpb25zID0ge31cbiAgfVxuICBvcHRpb25zID0gZGVmYXVsdHMob3B0aW9ucywge1xuICAgIGxvb3A6IHRydWVcbiAgfSlcbiAgZXh0ZW5kKG9wdGlvbnMsIHtcbiAgICB0eXBlOiBcInByb3RvdHlwZVwiLFxuICAgIGluaGVyaXQ6IGZhbHNlLFxuICAgIGluaXRpYWxpemU6IGluaXRpYWxpemVcbiAgfSlcbiAgRXh0ZW5zaW9uLmNhbGwodGhpcywgb3B0aW9ucylcbn1cblxuaW5oZXJpdChQcm90b3R5cGVFeHRlbnNpb24sIEV4dGVuc2lvbilcbiIsIm1vZHVsZS5leHBvcnRzID0gQ2hhbm5lbFxuXG4vKipcbiAqIENyZWF0ZSBhIGNoYW5uZWxcbiAqXG4gKiBAZXh0ZW5kcyBBcnJheVxuICogQGNvbnN0cnVjdG9yIENoYW5uZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiAqL1xuZnVuY3Rpb24gQ2hhbm5lbChuYW1lKSB7XG4gIHRoaXMubmFtZSA9IG5hbWUgfHwgXCJcIlxufVxuXG5DaGFubmVsLnByb3RvdHlwZSA9IFtdXG5DaGFubmVsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENoYW5uZWxcblxuLyoqXG4gKiBJbnZva2UgbGlzdGVuZXJzIHdpdGggdGhlIGdpdmVuIGFyZ3VtZW50cy5cbiAqIExpc3RlbmVycyBhcmUgY2FsbGVkIGluIHRoZSBvcmRlciB0aGV5IHdlcmUgcmVnaXN0ZXJlZC5cbiAqIElmIGEgbGlzdGVuZXIgcmV0dXJucyBhbnl0aGluZyBpdCBicmVha3MgdGhlIGxvb3AgYW5kIHJldHVybnMgdGhhdCB2YWx1ZS5cbiAqXG4gKiBAYWxpYXMgYnJvYWRjYXN0XG4gKiBAcmV0dXJuIHtib29sZWFufCp9XG4gKiAqL1xuQ2hhbm5lbC5wcm90b3R5cGUucHVibGlzaCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5zbGljZSgpXG4gIHZhciBsID0gbGlzdGVuZXJzLmxlbmd0aFxuICBpZiAoIWwpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHZhciBlcnIgPSBudWxsXG4gIHZhciBpID0gLTFcbiAgdmFyIGxpc3RlbmVyXG5cbiAgd2hpbGUgKCsraSA8IGwpIHtcbiAgICBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXVxuICAgIGlmIChsaXN0ZW5lci5wcm94eSkgbGlzdGVuZXIgPSBsaXN0ZW5lci5wcm94eVxuICAgIGVyciA9IGxpc3RlbmVyLmFwcGx5KG51bGwsIGFyZ3VtZW50cylcbiAgICBpZiAoZXJyICE9IG51bGwpIHJldHVybiBlcnJcbiAgfVxuXG4gIHJldHVybiBmYWxzZVxufVxuQ2hhbm5lbC5wcm90b3R5cGUuYnJvYWRjYXN0ID0gQ2hhbm5lbC5wcm90b3R5cGUucHVibGlzaFxuXG4vKipcbiAqIEFkZCBhIGxpc3RlbmVyIHRvIHRoaXMgY2hhbm5lbC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogQHJldHVybiB7Q2hhbm5lbH0gdGhpc1xuICogKi9cbkNoYW5uZWwucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gIGlmICh0eXBlb2YgbGlzdGVuZXIgIT0gXCJmdW5jdGlvblwiKSB7XG4gICAgY29uc29sZS53YXJuKFwiTGlzdGVuZXIgaXMgbm90IGEgZnVuY3Rpb25cIiwgbGlzdGVuZXIpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGlmICghdGhpcy5pc1N1YnNjcmliZWQobGlzdGVuZXIpKSB7XG4gICAgdGhpcy5wdXNoKGxpc3RlbmVyKVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBSZW1vdmUgYSBsaXN0ZW5lciBmcm9tIHRoZSBjaGFubmVsXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqIEByZXR1cm4ge0NoYW5uZWx9IHRoaXNcbiAqICovXG5DaGFubmVsLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gIHZhciBpID0gdGhpcy5pbmRleE9mKGxpc3RlbmVyKVxuICBpZiAofmkpIHRoaXMuc3BsaWNlKGksIDEpXG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgY2FsbGVkIG9ubHkgb25jZS5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogQHJldHVybiB7Q2hhbm5lbH0gdGhpc1xuICogKi9cbkNoYW5uZWwucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbihsaXN0ZW5lcikge1xuICB2YXIgY2hhbm5lbCA9IHRoaXNcblxuICAvLyBwaWdneWJhY2sgb24gdGhlIGxpc3RlbmVyXG4gIGxpc3RlbmVyLnByb3h5ID0gZnVuY3Rpb24gcHJveHkoKSB7XG4gICAgdmFyIHJldCA9IGxpc3RlbmVyLmFwcGx5KG51bGwsIGFyZ3VtZW50cylcbiAgICBjaGFubmVsLnVuc3Vic2NyaWJlKGxpc3RlbmVyKVxuICAgIHJldHVybiByZXRcbiAgfVxuICB0aGlzLnN1YnNjcmliZShsaXN0ZW5lcilcblxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgZnVuY3Rpb24gaXMgcmVnaXN0ZXJlZCBhcyBhIGxpc3RlbmVyIG9uIHRoZSBjaGFubmVsLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogKi9cbkNoYW5uZWwucHJvdG90eXBlLmlzU3Vic2NyaWJlZCA9IGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gIHJldHVybiAhIShsaXN0ZW5lciAmJiB+dGhpcy5pbmRleE9mKGxpc3RlbmVyKSlcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGhvdyBtYW55IGxpc3RlbmVycyBhcmUgcmVnaXN0ZXJlZCBvbiB0aGUgY2hhbm5lbC5cbiAqXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogKi9cbkNoYW5uZWwucHJvdG90eXBlLmhhc1N1YnNjcmliZXJzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmxlbmd0aCA+IDBcbn1cblxuLyoqXG4gKiBDbGVhcnMgYWxsIGxpc3RlbmVycyBmcm9tIHRoZSBjaGFubmVsLlxuICpcbiAqIEByZXR1cm4ge0NoYW5uZWx9IHRoaXNcbiAqICovXG5DaGFubmVsLnByb3RvdHlwZS5lbXB0eSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNwbGljZSgwKVxuICByZXR1cm4gdGhpc1xufVxuIiwidmFyIENoYW5uZWwgPSByZXF1aXJlKFwiLi9DaGFubmVsXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gUmFkaW9cblxuLyoqXG4gKiBAY29uc3RydWN0b3IgUmFkaW9cbiAqIEBtZW1iZXIge0FycmF5fSBjaGFubmVsc1xuICogKi9cbmZ1bmN0aW9uIFJhZGlvKCkge1xuICB0aGlzLmNoYW5uZWxzID0gW11cbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBjaGFubmVsIGlmIGl0IGRvZXNuJ3QgZXhpc3QgYWxyZWFkeVxuICogYW5kIHJldHVybiB0aGUgY2hhbm5lbC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gY2hhbm5lbFxuICogQHJldHVybiB7Q2hhbm5lbH1cbiAqICovXG5SYWRpby5wcm90b3R5cGUuY2hhbm5lbCA9IGZ1bmN0aW9uKGNoYW5uZWwpIHtcbiAgcmV0dXJuIHRoaXMuY2hhbm5lbHNbY2hhbm5lbF1cbiAgICAgIHx8ICh0aGlzLmNoYW5uZWxzW2NoYW5uZWxdID0gbmV3IENoYW5uZWwoY2hhbm5lbCkpXG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBjaGFubmVsIGV4aXN0cy5cbiAqXG4gKiBAcGFyYW0ge0NoYW5uZWx8U3RyaW5nfSBjaGFubmVsXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogKi9cblJhZGlvLnByb3RvdHlwZS5jaGFubmVsRXhpc3RzID0gZnVuY3Rpb24oY2hhbm5lbCkge1xuICByZXR1cm4gISFjaGFubmVsICYmICh0eXBlb2YgY2hhbm5lbCA9PSBcInN0cmluZ1wiXG4gICAgICAgICAgPyB0aGlzLmNoYW5uZWxzLmhhc093blByb3BlcnR5KGNoYW5uZWwpXG4gICAgICAgICAgOiB0aGlzLmNoYW5uZWxzLmhhc093blByb3BlcnR5KGNoYW5uZWwubmFtZSkpXG59XG5cbi8qKlxuICogRGVsZXRlIGEgY2hhbm5lbC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5uZWx8U3RyaW5nfSBjaGFubmVsXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogKi9cblJhZGlvLnByb3RvdHlwZS5kZWxldGVDaGFubmVsID0gZnVuY3Rpb24oY2hhbm5lbCkge1xuICBpZiAoY2hhbm5lbCBpbnN0YW5jZW9mIENoYW5uZWwpIHtcbiAgICByZXR1cm4gZGVsZXRlIHRoaXMuY2hhbm5lbHNbY2hhbm5lbC5uYW1lXVxuICB9XG4gIHJldHVybiBkZWxldGUgdGhpcy5jaGFubmVsc1tjaGFubmVsXVxufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgY2hhbm5lbCBoYXMgYW55IHN1YnNjcmliZXJzLlxuICogSWYgdGhlIGNoYW5uZWwgZG9lc24ndCBleGlzdHMgaXQncyBgZmFsc2VgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbm5lbHxTdHJpbmd9IGNoYW5uZWxcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKiAqL1xuUmFkaW8ucHJvdG90eXBlLmhhc1N1YnNjcmliZXJzID0gZnVuY3Rpb24oY2hhbm5lbCkge1xuICByZXR1cm4gdGhpcy5jaGFubmVsRXhpc3RzKGNoYW5uZWwpICYmIHRoaXMuY2hhbm5lbChjaGFubmVsKS5oYXNTdWJzY3JpYmVycygpXG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBsaXN0ZW5lciBpcyBzdWJzY3JpYmVkIHRvIGEgY2hhbm5lbC5cbiAqIElmIHRoZSBjaGFubmVsIGRvZXNuJ3QgZXhpc3RzIGl0J3MgYGZhbHNlYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5uZWx8U3RyaW5nfSBjaGFubmVsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqICovXG5SYWRpby5wcm90b3R5cGUuaXNTdWJzY3JpYmVkID0gZnVuY3Rpb24oY2hhbm5lbCwgbGlzdGVuZXIpIHtcbiAgcmV0dXJuIHRoaXMuY2hhbm5lbEV4aXN0cyhjaGFubmVsKSAmJiB0aGlzLmNoYW5uZWwoY2hhbm5lbCkuaXNTdWJzY3JpYmVkKGxpc3RlbmVyKVxufVxuXG4vKipcbiAqIFNlbmQgYXJndW1lbnRzIG9uIGEgY2hhbm5lbC5cbiAqIElmIHRoZSBjaGFubmVsIGRvZXNuJ3QgZXhpc3RzIG5vdGhpbmcgaGFwcGVucy5cbiAqXG4gKiBAYWxpYXMgYnJvYWRjYXN0XG4gKiBAcGFyYW0ge0NoYW5uZWx8U3RyaW5nfSBjaGFubmVsXG4gKiBAcmV0dXJuIHsqfVxuICogKi9cblJhZGlvLnByb3RvdHlwZS5wdWJsaXNoID0gZnVuY3Rpb24oY2hhbm5lbCkge1xuICBpZiAodGhpcy5jaGFubmVsRXhpc3RzKGNoYW5uZWwpKSB7XG4gICAgY2hhbm5lbCA9IHRoaXMuY2hhbm5lbChjaGFubmVsKVxuICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgcmV0dXJuIGNoYW5uZWwuYnJvYWRjYXN0LmFwcGx5KGNoYW5uZWwsIGFyZ3MpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5SYWRpby5wcm90b3R5cGUuYnJvYWRjYXN0ID0gUmFkaW8ucHJvdG90eXBlLnB1Ymxpc2hcblxuLyoqXG4gKiBTdWJzY3JpYmUgdG8gYSBjaGFubmVsIHdpdGggYSBsaXN0ZW5lci5cbiAqIEl0IGFsc28gY3JlYXRlcyB0aGUgY2hhbm5lbCBpZiBpdCBkb2Vzbid0IGV4aXN0cyB5ZXQuXG4gKlxuICogQHBhcmFtIHtDaGFubmVsfFN0cmluZ30gY2hhbm5lbFxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqIEByZXR1cm4ge1JhZGlvfSB0aGlzXG4gKiAqL1xuUmFkaW8ucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uKGNoYW5uZWwsIGxpc3RlbmVyKSB7XG4gIHRoaXMuY2hhbm5lbChjaGFubmVsKS5zdWJzY3JpYmUobGlzdGVuZXIpXG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogVW5zdWJzY3JpYmUgYSBsaXN0ZW5lciBmcm9tIGEgY2hhbm5lbC5cbiAqIElmIHRoZSBjaGFubmVsIGRvZXNuJ3QgZXhpc3RzIG5vdGhpbmcgaGFwcGVucy5cbiAqXG4gKiBAcGFyYW0ge0NoYW5uZWx8U3RyaW5nfSBjaGFubmVsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogQHJldHVybiB7UmFkaW99IHRoaXNcbiAqICovXG5SYWRpby5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbihjaGFubmVsLCBsaXN0ZW5lcikge1xuICBpZiAodGhpcy5jaGFubmVsRXhpc3RzKGNoYW5uZWwpKSB7XG4gICAgdGhpcy5jaGFubmVsKGNoYW5uZWwpLnVuc3Vic2NyaWJlKGxpc3RlbmVyKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogU3Vic2NyaWJlIGEgbGlzdGVuZXIgdG8gYSBjaGFubmVsXG4gKiB0aGF0IHVuc3Vic2NyaWJlcyBhZnRlciB0aGUgZmlyc3QgYnJvYWRjYXN0IGl0IHJlY2VpdmVzLlxuICogSXQgYWxzbyBjcmVhdGVzIHRoZSBjaGFubmVsIGlmIGl0IGRvZXNuJ3QgZXhpc3RzIHlldC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5uZWx8U3RyaW5nfSBjaGFubmVsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogQHJldHVybiB7UmFkaW99IHRoaXNcbiAqICovXG5SYWRpby5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uKGNoYW5uZWwsIGxpc3RlbmVyKSB7XG4gIHRoaXMuY2hhbm5lbChjaGFubmVsKS5wZWVrKGxpc3RlbmVyKVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIEVtcHR5IGEgY2hhbm5lbCByZW1vdmluZyBldmVyeSBzdWJzY3JpYmVyIGl0IGhvbGRzLFxuICogYnV0IG5vdCBkZWxldGluZyB0aGUgY2hhbm5lbCBpdHNlbGYuXG4gKiBJZiB0aGUgY2hhbm5lbCBkb2Vzbid0IGV4aXN0cyBub3RoaW5nIGhhcHBlbnMuXG4gKlxuICogQHBhcmFtIHtDaGFubmVsfFN0cmluZ30gY2hhbm5lbFxuICogQHJldHVybiB7UmFkaW99IHRoaXNcbiAqICovXG5SYWRpby5wcm90b3R5cGUuZW1wdHlDaGFubmVsID0gZnVuY3Rpb24oY2hhbm5lbCkge1xuICBpZiAodGhpcy5jaGFubmVsRXhpc3RzKGNoYW5uZWwpKSB7XG4gICAgdGhpcy5jaGFubmVsKGNoYW5uZWwpLmVtcHR5KClcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuIiwidmFyIFJhZGlvID0gcmVxdWlyZShcIi4vUmFkaW9cIilcbnZhciBDaGFubmVsID0gcmVxdWlyZShcIi4vQ2hhbm5lbFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJhZGlvXG5tb2R1bGUuZXhwb3J0cy5DaGFubmVsID0gQ2hhbm5lbFxuIiwidmFyIGluaGVyaXQgPSByZXF1aXJlKFwiYmFja3lhcmQvZnVuY3Rpb24vaW5oZXJpdFwiKVxudmFyIGluY2x1ZGUgPSByZXF1aXJlKFwiYmFja3lhcmQvZnVuY3Rpb24vaW5jbHVkZVwiKVxudmFyIFNlbGVjdG9yID0gcmVxdWlyZShcIm1hdGNoYm94LWRvbS9TZWxlY3RvclwiKVxudmFyIEV2ZW50ID0gcmVxdWlyZShcIi4vRXZlbnRcIilcbnZhciBDaGlsZCA9IHJlcXVpcmUoXCIuL0NoaWxkXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aW9uXG5cbkFjdGlvbi5ERUZBVUxUX0FUVFJJQlVURSA9IFwiZGF0YS1hY3Rpb25cIlxuXG5mdW5jdGlvbiBBY3Rpb24gKGFjdGlvbkluaXQpIHtcbiAgdGhpcy5sb29rdXAgPSBhY3Rpb25Jbml0Lmxvb2t1cCB8fCBudWxsXG4gIHRoaXMuZXZlbnQgPSBuZXcgRXZlbnQoYWN0aW9uSW5pdC5ldmVudE9wdGlvbnMpXG59XG5cbkFjdGlvbi5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIChhY3Rpb24sIHZpZXdOYW1lKSB7XG4gIHZhciBzZWxlY3RvciA9IG5ldyBTZWxlY3Rvcih7YXR0cmlidXRlOiBBY3Rpb24uREVGQVVMVF9BVFRSSUJVVEUsIHZhbHVlOiBhY3Rpb259KVxuXG4gIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLmV2ZW50LnRhcmdldCkpIHtcbiAgICB0aGlzLmV2ZW50LnRhcmdldCA9IFtdXG4gIH1cblxuICB0aGlzLmV2ZW50LnRhcmdldCA9IHRoaXMuZXZlbnQudGFyZ2V0Lm1hcChmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICBpZiAoISh0eXBlb2Ygc2VsZWN0b3IgPT0gXCJzdHJpbmdcIikpIHtcbiAgICAgIHJldHVybiBzZWxlY3RvclxuICAgIH1cblxuICAgIGlmICghdmlld05hbWUgfHwgc2VsZWN0b3JbMF0gIT0gU2VsZWN0b3IuREVGQVVMVF9ORVNUX1NFUEFSQVRPUikge1xuICAgICAgcmV0dXJuIG5ldyBDaGlsZChzZWxlY3RvcilcbiAgICB9XG5cbiAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnN1YnN0cigxKVxuICAgIHJldHVybiBuZXcgQ2hpbGQoc2VsZWN0b3IpLnByZWZpeCh2aWV3TmFtZSlcbiAgfSlcblxuICBpZiAodmlld05hbWUpIHtcbiAgICB0aGlzLmV2ZW50LnRhcmdldC5wdXNoKHNlbGVjdG9yLnByZWZpeCh2aWV3TmFtZSkpXG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy5ldmVudC50YXJnZXQucHVzaChzZWxlY3RvcilcbiAgfVxuXG4gIHZhciBsb29rdXAgPSB0aGlzLmxvb2t1cFxuICB0aGlzLmV2ZW50LnRyYW5zZm9ybSA9IGZ1bmN0aW9uICh2aWV3LCBkZWxlZ2F0ZVNlbGVjdG9yLCBkZWxlZ2F0ZUVsZW1lbnQpIHtcbiAgICB2YXIgY2hpbGRcbiAgICBpZiAoZGVsZWdhdGVTZWxlY3RvciBpbnN0YW5jZW9mIENoaWxkKSB7XG4gICAgICBjaGlsZCA9IHZpZXcuZ2V0Q2hpbGRWaWV3KGRlbGVnYXRlU2VsZWN0b3IubmFtZSwgZGVsZWdhdGVFbGVtZW50KVxuICAgIH1cbiAgICBlbHNlIGlmIChkZWxlZ2F0ZVNlbGVjdG9yIGluc3RhbmNlb2YgU2VsZWN0b3IgJiYgbG9va3VwKSB7XG4gICAgICBjaGlsZCA9IHZpZXcuZ2V0Q2hpbGRWaWV3KGxvb2t1cCwgZGVsZWdhdGVFbGVtZW50KVxuICAgIH1cblxuICAgIHJldHVybiBjaGlsZCB8fCBkZWxlZ2F0ZUVsZW1lbnRcbiAgfVxufVxuXG5BY3Rpb24ucHJvdG90eXBlLnJlZ2lzdGVyRXZlbnQgPSBmdW5jdGlvbiAoZWxlbWVudCwgY29udGV4dCkge1xuICB0aGlzLmV2ZW50LnJlZ2lzdGVyKGVsZW1lbnQsIGNvbnRleHQpXG59XG5cbkFjdGlvbi5wcm90b3R5cGUudW5SZWdpc3RlckV2ZW50ID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgdGhpcy5ldmVudC51blJlZ2lzdGVyKGVsZW1lbnQpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IEFjdGlvbkluaXRcblxuZnVuY3Rpb24gQWN0aW9uSW5pdCAoZXZlbnQsIHRhcmdldCwgbG9va3VwLCBoYW5kbGVyKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBBY3Rpb25Jbml0KSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gbmV3IEFjdGlvbkluaXQoZXZlbnQgfHwge30pXG4gICAgICBjYXNlIDI6XG4gICAgICAgIHJldHVybiBuZXcgQWN0aW9uSW5pdCh7XG4gICAgICAgICAgdHlwZTogZXZlbnQsXG4gICAgICAgICAgaGFuZGxlcjogdGFyZ2V0XG4gICAgICAgIH0pXG4gICAgICBjYXNlIDM6XG4gICAgICAgIHJldHVybiBuZXcgQWN0aW9uSW5pdCh7XG4gICAgICAgICAgdHlwZTogZXZlbnQsXG4gICAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgICAgaGFuZGxlcjogbG9va3VwXG4gICAgICAgIH0pXG4gICAgICBjYXNlIDQ6XG4gICAgICAgIHJldHVybiBuZXcgQWN0aW9uSW5pdCh7XG4gICAgICAgICAgdHlwZTogZXZlbnQsXG4gICAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgICAgbG9va3VwOiBsb29rdXAsXG4gICAgICAgICAgaGFuZGxlcjogaGFuZGxlclxuICAgICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGNhc2UgMTpcbiAgICAgIGV2ZW50ID0gZXZlbnQgfHwge31cbiAgICAgIGJyZWFrXG4gICAgY2FzZSAyOlxuICAgICAgZXZlbnQgPSB7XG4gICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICBoYW5kbGVyOiB0YXJnZXRcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgY2FzZSAzOlxuICAgICAgZXZlbnQgPSB7XG4gICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgaGFuZGxlcjogbG9va3VwXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgNDpcbiAgICAgIGV2ZW50ID0ge1xuICAgICAgICB0eXBlOiBldmVudCxcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIGxvb2t1cDogbG9va3VwLFxuICAgICAgICBoYW5kbGVyOiBoYW5kbGVyXG4gICAgICB9XG4gICAgICBicmVha1xuICB9XG5cbiAgdGhpcy5ldmVudE9wdGlvbnMgPSBldmVudFxuICB0aGlzLmxvb2t1cCA9IGV2ZW50Lmxvb2t1cFxufVxuIiwidmFyIGluaGVyaXQgPSByZXF1aXJlKFwiYmFja3lhcmQvZnVuY3Rpb24vaW5oZXJpdFwiKVxudmFyIFNlbGVjdG9yID0gcmVxdWlyZShcIm1hdGNoYm94LWRvbS9TZWxlY3RvclwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IENoaWxkXG5cbkNoaWxkLkRFRkFVTFRfQVRUUklCVVRFID0gXCJkYXRhLXZpZXdcIlxuXG5mdW5jdGlvbiBDaGlsZCAoY2hpbGQpIHtcbiAgY2hpbGQgPSBjaGlsZCB8fCB7fVxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ2hpbGQpKSB7XG4gICAgcmV0dXJuIG5ldyBDaGlsZChjaGlsZClcbiAgfVxuXG4gIHN3aXRjaCAodHlwZW9mIGNoaWxkKSB7XG4gICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICBTZWxlY3Rvci5jYWxsKHRoaXMsIHtDb25zdHJ1Y3RvcjogY2hpbGR9KVxuICAgICAgYnJlYWtcbiAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICBTZWxlY3Rvci5jYWxsKHRoaXMsIHt2YWx1ZTogY2hpbGR9KVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgU2VsZWN0b3IuY2FsbCh0aGlzLCBjaGlsZClcbiAgfVxuXG4gIHRoaXMuYXR0cmlidXRlID0gdGhpcy5hdHRyaWJ1dGUgfHwgQ2hpbGQuREVGQVVMVF9BVFRSSUJVVEVcbiAgdGhpcy5hdXRvc2VsZWN0ID0gY2hpbGQuYXV0b3NlbGVjdCA9PSB1bmRlZmluZWQgPyBmYWxzZSA6IGNoaWxkLmF1dG9zZWxlY3RcbiAgdGhpcy5wcm9wZXJ0eSA9IGNoaWxkLnByb3BlcnR5IHx8IHRoaXMudmFsdWVcbiAgdGhpcy5sb29rdXAgPSBjaGlsZC5sb29rdXAgfHwgbnVsbFxuICB0aGlzLm5hbWUgPSBjaGlsZC5uYW1lIHx8IHRoaXMudmFsdWVcbn1cblxuaW5oZXJpdChDaGlsZCwgU2VsZWN0b3IpXG5cbkNoaWxkLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24gKHByb3BlcnR5LCBjaGlsZE5hbWUpIHtcbiAgdGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5XG4gIHRoaXMubmFtZSA9IGNoaWxkTmFtZVxufVxuXG5DaGlsZC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzKVxufVxuIiwidmFyIGluaGVyaXQgPSByZXF1aXJlKFwiYmFja3lhcmQvZnVuY3Rpb24vaW5oZXJpdFwiKVxudmFyIE1vZGlmaWVySW5pdCA9IHJlcXVpcmUoXCIuL01vZGlmaWVySW5pdFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVudW1Nb2RpZmllclxuXG5mdW5jdGlvbiBFbnVtTW9kaWZpZXIgKGRlZmF1bHRWYWx1ZSwgdmFsdWVzLCBhbmltYXRpb25EdXJhdGlvbikge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgRW51bU1vZGlmaWVyKSkge1xuICAgIHJldHVybiBuZXcgRW51bU1vZGlmaWVyKGRlZmF1bHRWYWx1ZSwgdmFsdWVzLCBhbmltYXRpb25EdXJhdGlvbilcbiAgfVxuXG4gIHRoaXMudHlwZSA9IFwiZW51bVwiXG4gIHRoaXMuZGVmYXVsdCA9IGRlZmF1bHRWYWx1ZVxuICB0aGlzLnZhbHVlcyA9IHZhbHVlc1xuICB0aGlzLmFuaW1hdGlvbkR1cmF0aW9uID0gYW5pbWF0aW9uRHVyYXRpb25cbn1cblxuaW5oZXJpdChFbnVtTW9kaWZpZXIsIE1vZGlmaWVySW5pdClcbiIsInZhciBkZWxlZ2F0ZSA9IHJlcXVpcmUoXCJtYXRjaGJveC1kb20vZXZlbnQvZGVsZWdhdGVcIilcbnZhciBTZWxlY3RvciA9IHJlcXVpcmUoXCJtYXRjaGJveC1kb20vU2VsZWN0b3JcIilcbnZhciBDaGlsZCA9IHJlcXVpcmUoXCIuL0NoaWxkXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRcblxuZnVuY3Rpb24gRXZlbnQgKGV2ZW50SW5pdCkge1xuICB0aGlzLnR5cGUgPSBldmVudEluaXQudHlwZVxuICB0aGlzLnRhcmdldCA9IGV2ZW50SW5pdC50YXJnZXRcbiAgdGhpcy5vbmNlID0gISFldmVudEluaXQub25jZVxuICB0aGlzLmNhcHR1cmUgPSAhIWV2ZW50SW5pdC5jYXB0dXJlXG4gIHRoaXMuaGFuZGxlciA9IGV2ZW50SW5pdC5oYW5kbGVyXG4gIHRoaXMudHJhbnNmb3JtID0gZXZlbnRJbml0LnRyYW5zZm9ybVxuICB0aGlzLnByb3h5ID0gdGhpcy5oYW5kbGVyXG59XG5cbkV2ZW50LnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24gKHZpZXcsIHZpZXdOYW1lKSB7XG4gIGlmICh0aGlzLnRhcmdldCkge1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLnRhcmdldCkpIHtcbiAgICAgIHRoaXMudGFyZ2V0ID0gW3RoaXMudGFyZ2V0XVxuICAgIH1cblxuICAgIHRoaXMudGFyZ2V0ID0gdGhpcy50YXJnZXQubWFwKGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgICAgaWYgKCEodHlwZW9mIHNlbGVjdG9yID09IFwic3RyaW5nXCIpKSB7XG4gICAgICAgIHJldHVybiBzZWxlY3RvclxuICAgICAgfVxuXG4gICAgICBpZiAoc2VsZWN0b3JbMF0gIT0gU2VsZWN0b3IuREVGQVVMVF9ORVNUX1NFUEFSQVRPUikge1xuICAgICAgICByZXR1cm4gbmV3IENoaWxkKHNlbGVjdG9yKVxuICAgICAgfVxuXG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnN1YnN0cigxKVxuICAgICAgcmV0dXJuIHZpZXcuY2hpbGRyZW5bc2VsZWN0b3JdXG4gICAgfSlcbiAgfVxuXG4gIGlmICghdGhpcy50cmFuc2Zvcm0pIHtcbiAgICB0aGlzLnRyYW5zZm9ybSA9IGZ1bmN0aW9uICh2aWV3LCBkZWxlZ2F0ZVNlbGVjdG9yLCBkZWxlZ2F0ZUVsZW1lbnQpIHtcbiAgICAgIHZhciBjaGlsZFxuICAgICAgaWYgKGRlbGVnYXRlU2VsZWN0b3IgaW5zdGFuY2VvZiBDaGlsZCkge1xuICAgICAgICBjaGlsZCA9IHZpZXcuZ2V0Q2hpbGRWaWV3KGRlbGVnYXRlU2VsZWN0b3IucHJvcGVydHksIGRlbGVnYXRlRWxlbWVudClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNoaWxkIHx8IGRlbGVnYXRlRWxlbWVudFxuICAgIH1cbiAgfVxufVxuXG5FdmVudC5wcm90b3R5cGUucmVnaXN0ZXIgPSBmdW5jdGlvbiAoZWxlbWVudCwgY29udGV4dCkge1xuICBpZiAodGhpcy50YXJnZXQpIHtcbiAgICB0aGlzLnByb3h5ID0gZGVsZWdhdGUoe1xuICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgIGV2ZW50OiB0aGlzLnR5cGUsXG4gICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgdHJhbnNmb3JtOiB0aGlzLnRyYW5zZm9ybVxuICAgIH0pXG4gICAgdGhpcy5wcm94eS5tYXRjaCh0aGlzLnRhcmdldCwgdGhpcy5oYW5kbGVyKVxuICB9XG4gIGVsc2Uge1xuICAgIGlmICh0aGlzLm9uY2UpIHtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLnR5cGUsIHRoaXMuaGFuZGxlciwgdGhpcy5jYXB0dXJlKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLnR5cGUsIHRoaXMuaGFuZGxlciwgdGhpcy5jYXB0dXJlKVxuICAgIH1cbiAgfVxufVxuXG5FdmVudC5wcm90b3R5cGUudW5SZWdpc3RlciA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICh0aGlzLnByb3h5KSB7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy5wcm94eSwgdGhpcy5jYXB0dXJlKVxuICB9XG4gIGVsc2Uge1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLnR5cGUsIHRoaXMuaGFuZGxlciwgdGhpcy5jYXB0dXJlKVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IEV2ZW50SW5pdFxuXG5mdW5jdGlvbiBFdmVudEluaXQgKGV2ZW50LCB0YXJnZXQsIGNhcHR1cmUsIG9uY2UsIGhhbmRsZXIpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEV2ZW50SW5pdCkpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIG5ldyBFdmVudEluaXQoZXZlbnQpXG4gICAgICBjYXNlIDI6XG4gICAgICAgIHJldHVybiBuZXcgRXZlbnRJbml0KHtcbiAgICAgICAgICB0eXBlOiBldmVudCxcbiAgICAgICAgICBoYW5kbGVyOiB0YXJnZXRcbiAgICAgICAgfSlcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgcmV0dXJuIG5ldyBFdmVudEluaXQoe1xuICAgICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICAgIGhhbmRsZXI6IGNhcHR1cmVcbiAgICAgICAgfSlcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgcmV0dXJuIG5ldyBFdmVudEluaXQoe1xuICAgICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICAgIGNhcHR1cmU6IGNhcHR1cmUsXG4gICAgICAgICAgaGFuZGxlcjogb25jZVxuICAgICAgICB9KVxuICAgICAgY2FzZSA1OlxuICAgICAgICByZXR1cm4gbmV3IEV2ZW50SW5pdCh7XG4gICAgICAgICAgdHlwZTogZXZlbnQsXG4gICAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgICAgY2FwdHVyZTogY2FwdHVyZSxcbiAgICAgICAgICBvbmNlOiBvbmNlLFxuICAgICAgICAgIGhhbmRsZXI6IGhhbmRsZXJcbiAgICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBjYXNlIDE6XG4gICAgICAgIGV2ZW50ID0ge3R5cGU6IGV2ZW50fVxuICAgICAgYnJlYWtcbiAgICBjYXNlIDI6XG4gICAgICBldmVudCA9IHtcbiAgICAgICAgdHlwZTogZXZlbnQsXG4gICAgICAgIGhhbmRsZXI6IHRhcmdldFxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlIDM6XG4gICAgICBldmVudCA9IHtcbiAgICAgICAgdHlwZTogZXZlbnQsXG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICBoYW5kbGVyOiBjYXB0dXJlXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgNDpcbiAgICAgIGV2ZW50ID0ge1xuICAgICAgICB0eXBlOiBldmVudCxcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIGNhcHR1cmU6IGNhcHR1cmUsXG4gICAgICAgIGhhbmRsZXI6IG9uY2VcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgY2FzZSA1OlxuICAgICAgZXZlbnQgPSB7XG4gICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgY2FwdHVyZTogY2FwdHVyZSxcbiAgICAgICAgb25jZTogb25jZSxcbiAgICAgICAgaGFuZGxlcjogaGFuZGxlclxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgfVxuXG4gIHRoaXMudHlwZSA9IGV2ZW50LnR5cGVcbiAgdGhpcy50YXJnZXQgPSBldmVudC50YXJnZXRcbiAgdGhpcy5vbmNlID0gISFldmVudC5vbmNlXG4gIHRoaXMuY2FwdHVyZSA9ICEhZXZlbnQuY2FwdHVyZVxuICB0aGlzLmhhbmRsZXIgPSBldmVudC5oYW5kbGVyXG4gIHRoaXMudHJhbnNmb3JtID0gZXZlbnQudHJhbnNmb3JtXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IE1vZGlmaWVyXG5cbmZ1bmN0aW9uIE1vZGlmaWVyIChtb2RpZkluaXQpIHtcbiAgdGhpcy50eXBlID0gbW9kaWZJbml0LnR5cGVcbiAgdGhpcy5kZWZhdWx0ID0gbW9kaWZJbml0LmRlZmF1bHQgPT0gbnVsbCA/IG51bGwgOiBtb2RpZkluaXQuZGVmYXVsdFxuICB0aGlzLnZhbHVlcyA9IFtdXG4gIHRoaXMudmFsdWUgPSBudWxsXG4gIHRoaXMub25jaGFuZ2UgPSBudWxsXG4gIHRoaXMuYW5pbWF0aW9uRHVyYXRpb24gPSBtb2RpZkluaXQuYW5pbWF0aW9uRHVyYXRpb24gfHwgMFxuICB0aGlzLnRpbWVySWQgPSBudWxsXG4gIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgY2FzZSBcInN3aXRjaFwiOlxuICAgICAgdGhpcy52YWx1ZXMucHVzaChtb2RpZkluaXQub24gJiYgdHlwZW9mIG1vZGlmSW5pdC5vbiA9PSBcInN0cmluZ1wiID8gbW9kaWZJbml0Lm9uIDogbnVsbClcbiAgICAgIHRoaXMudmFsdWVzLnB1c2gobW9kaWZJbml0Lm9mZiAmJiB0eXBlb2YgbW9kaWZJbml0Lm9mZiA9PSBcInN0cmluZ1wiID8gbW9kaWZJbml0Lm9mZiA6IG51bGwpXG4gICAgICBicmVha1xuICAgIGNhc2UgXCJlbnVtXCI6XG4gICAgICB0aGlzLnZhbHVlcyA9IG1vZGlmSW5pdC52YWx1ZXMgfHwgW11cbiAgICAgIGJyZWFrXG4gIH1cbn1cblxuTW9kaWZpZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRleHQpIHtcbiAgdmFyIGN1cnJlbnRWYWx1ZVxuICB2YXIgaGFzSW5pdGlhbFZhbHVlID0gdGhpcy52YWx1ZXMuc29tZShmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgJiYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnModmFsdWUpKSB7XG4gICAgICBjdXJyZW50VmFsdWUgPSB2YWx1ZVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH0pXG5cbiAgaWYgKGhhc0luaXRpYWxWYWx1ZSkge1xuICAgIGlmICh0aGlzLnR5cGUgPT0gXCJzd2l0Y2hcIikge1xuICAgICAgLy8gb25cbiAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHRoaXMudmFsdWVzWzBdKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0cnVlXG4gICAgICB9XG4gICAgICAvLyBvZmZcbiAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHRoaXMudmFsdWVzWzFdKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMudmFsdWUgPSBjdXJyZW50VmFsdWVcbiAgICB9XG4gIH1cbiAgZWxzZSBpZiAodGhpcy5kZWZhdWx0ICE9IG51bGwpIHtcbiAgICB0aGlzLnNldCh0aGlzLmRlZmF1bHQsIGVsZW1lbnQsIGNvbnRleHQpXG4gIH1cbn1cblxuTW9kaWZpZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMudmFsdWVcbn1cblxuTW9kaWZpZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2YWx1ZSwgZWxlbWVudCwgY29udGV4dCkge1xuICBjb250ZXh0ID0gY29udGV4dCB8fCBlbGVtZW50XG5cbiAgdmFyIHByZXZpb3VzVmFsdWUgPSB0aGlzLnZhbHVlXG4gIHZhciBwcmV2aW91c0NsYXNzTmFtZSA9IHByZXZpb3VzVmFsdWVcbiAgdmFyIG5ld1ZhbHVlID0gdmFsdWVcbiAgdmFyIG5ld0NsYXNzTmFtZSA9IHZhbHVlXG5cbiAgaWYgKHRoaXMudHlwZSA9PSBcInN3aXRjaFwiKSB7XG4gICAgbmV3VmFsdWUgPSAhIXZhbHVlXG5cbiAgICB2YXIgb24gPSB0aGlzLnZhbHVlc1swXVxuICAgIHZhciBvZmYgPSB0aGlzLnZhbHVlc1sxXVxuXG4gICAgcHJldmlvdXNDbGFzc05hbWUgPSBwcmV2aW91c1ZhbHVlID09IG51bGxcbiAgICAgICAgPyBudWxsXG4gICAgICAgIDogcHJldmlvdXNWYWx1ZSA/IG9uIDogb2ZmXG4gICAgbmV3Q2xhc3NOYW1lID0gbmV3VmFsdWUgPyBvbiA6IG9mZlxuICB9XG5cbiAgaWYgKHByZXZpb3VzVmFsdWUgPT09IG5ld1ZhbHVlIHx8ICF+dGhpcy52YWx1ZXMuaW5kZXhPZihuZXdDbGFzc05hbWUpKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIH1cbiAgaWYgKHByZXZpb3VzQ2xhc3NOYW1lICYmIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKHByZXZpb3VzQ2xhc3NOYW1lKSkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShwcmV2aW91c0NsYXNzTmFtZSlcbiAgfVxuICB0aGlzLnZhbHVlID0gbmV3VmFsdWVcbiAgaWYgKG5ld0NsYXNzTmFtZSkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChuZXdDbGFzc05hbWUpXG4gIH1cblxuICByZXR1cm4gY2FsbE9uQ2hhbmdlKHRoaXMsIGNvbnRleHQsIHByZXZpb3VzVmFsdWUsIG5ld1ZhbHVlKVxufVxuXG5Nb2RpZmllci5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRleHQpIHtcbiAgY29udGV4dCA9IGNvbnRleHQgfHwgZWxlbWVudFxuICBpZiAodGhpcy52YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIH1cbiAgaWYgKHRoaXMudGltZXJJZCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVySWQpXG4gICAgdGhpcy50aW1lcklkID0gbnVsbFxuICB9XG5cbiAgdmFyIHByZXZpb3VzVmFsdWUgPSB0aGlzLnZhbHVlXG4gIHZhciBwcmV2aW91c0NsYXNzTmFtZSA9IHByZXZpb3VzVmFsdWVcblxuICBpZiAodGhpcy50eXBlID09IFwic3dpdGNoXCIpIHtcbiAgICB2YXIgb24gPSB0aGlzLnZhbHVlc1swXVxuICAgIHZhciBvZmYgPSB0aGlzLnZhbHVlc1sxXVxuXG4gICAgcHJldmlvdXNDbGFzc05hbWUgPSBwcmV2aW91c1ZhbHVlID09IG51bGxcbiAgICAgICAgPyBudWxsXG4gICAgICAgIDogcHJldmlvdXNWYWx1ZSA/IG9uIDogb2ZmXG4gIH1cblxuICBpZiAocHJldmlvdXNDbGFzc05hbWUgJiYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMocHJldmlvdXNDbGFzc05hbWUpKSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHByZXZpb3VzQ2xhc3NOYW1lKVxuICB9XG4gIHRoaXMudmFsdWUgPSBudWxsXG5cbiAgcmV0dXJuIGNhbGxPbkNoYW5nZSh0aGlzLCBjb250ZXh0LCBwcmV2aW91c1ZhbHVlLCBudWxsKVxufVxuXG5mdW5jdGlvbiBjYWxsT25DaGFuZ2UgKG1vZGlmaWVyLCBjb250ZXh0LCBwcmV2aW91c1ZhbHVlLCBuZXdWYWx1ZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICBpZiAobW9kaWZpZXIuYW5pbWF0aW9uRHVyYXRpb24pIHtcbiAgICAgIGlmIChtb2RpZmllci50aW1lcklkKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChtb2RpZmllci50aW1lcklkKVxuICAgICAgICBtb2RpZmllci50aW1lcklkID0gbnVsbFxuICAgICAgfVxuICAgICAgbW9kaWZpZXIudGltZXJJZCA9IHNldFRpbWVvdXQocmVzb2x2ZSwgbW9kaWZpZXIuYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmVzb2x2ZSgpXG4gICAgfVxuICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBtb2RpZmllci5vbmNoYW5nZSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICByZXR1cm4gbW9kaWZpZXIub25jaGFuZ2UuY2FsbChjb250ZXh0LCBwcmV2aW91c1ZhbHVlLCBuZXdWYWx1ZSlcbiAgICAgICAgfVxuICAgICAgfSlcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gTW9kaWZpZXJJbml0XG5cbmZ1bmN0aW9uIE1vZGlmaWVySW5pdCAob3B0aW9ucykge1xuICB0aGlzLnR5cGUgPSBvcHRpb25zLnR5cGVcbiAgdGhpcy5kZWZhdWx0ID0gb3B0aW9ucy5kZWZhdWx0ID09IG51bGwgPyBudWxsIDogb3B0aW9ucy5kZWZhdWx0XG4gIHRoaXMudmFsdWVzID0gb3B0aW9ucy52YWx1ZXNcbiAgdGhpcy5hbmltYXRpb25EdXJhdGlvbiA9IG9wdGlvbnMuYW5pbWF0aW9uRHVyYXRpb25cbn1cbiIsInZhciBpbmhlcml0ID0gcmVxdWlyZShcImJhY2t5YXJkL2Z1bmN0aW9uL2luaGVyaXRcIilcbnZhciBNb2RpZmllckluaXQgPSByZXF1aXJlKFwiLi9Nb2RpZmllckluaXRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBTd2l0Y2hNb2RpZmllclxuXG5mdW5jdGlvbiBTd2l0Y2hNb2RpZmllciAoZGVmYXVsdFZhbHVlLCBvbiwgb2ZmLCBhbmltYXRpb25EdXJhdGlvbikge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU3dpdGNoTW9kaWZpZXIpKSB7XG4gICAgcmV0dXJuIG5ldyBTd2l0Y2hNb2RpZmllcihkZWZhdWx0VmFsdWUsIG9uLCBvZmYsIGFuaW1hdGlvbkR1cmF0aW9uKVxuICB9XG5cbiAgdGhpcy50eXBlID0gXCJzd2l0Y2hcIlxuICB0aGlzLmRlZmF1bHQgPSBkZWZhdWx0VmFsdWVcbiAgdGhpcy5vbiA9IG9uXG4gIHRoaXMub2ZmID0gb2ZmXG4gIHRoaXMuYW5pbWF0aW9uRHVyYXRpb24gPSBhbmltYXRpb25EdXJhdGlvblxufVxuXG5pbmhlcml0KFN3aXRjaE1vZGlmaWVyLCBNb2RpZmllckluaXQpXG4iLCJ2YXIgZGVmaW5lID0gcmVxdWlyZShcImJhY2t5YXJkL29iamVjdC9kZWZpbmVcIilcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoXCJiYWNreWFyZC9vYmplY3QvZGVmYXVsdHNcIilcbnZhciBmb3JJbiA9IHJlcXVpcmUoXCJiYWNreWFyZC9vYmplY3QvaW5cIilcbnZhciBmYWN0b3J5ID0gcmVxdWlyZShcIm9mZnNwcmluZ1wiKVxudmFyIEluc3RhbmNlRXh0ZW5zaW9uID0gZmFjdG9yeS5JbnN0YW5jZUV4dGVuc2lvblxudmFyIENhY2hlRXh0ZW5zaW9uID0gZmFjdG9yeS5DYWNoZUV4dGVuc2lvblxudmFyIERvbURhdGEgPSByZXF1aXJlKFwibWF0Y2hib3gtZG9tL0RhdGFcIilcbnZhciBkb21EYXRhID0gcmVxdWlyZShcIm1hdGNoYm94LWRvbS9kYXRhXCIpXG52YXIgU2VsZWN0b3IgPSByZXF1aXJlKFwibWF0Y2hib3gtZG9tL1NlbGVjdG9yXCIpXG52YXIgRnJhZ21lbnQgPSByZXF1aXJlKFwibWF0Y2hib3gtZG9tL0ZyYWdtZW50XCIpXG52YXIgUmFkaW8gPSByZXF1aXJlKFwic3RhdGlvbnNcIilcblxudmFyIEV2ZW50SW5pdCA9IHJlcXVpcmUoXCIuL0V2ZW50SW5pdFwiKVxudmFyIEFjdGlvbkluaXQgPSByZXF1aXJlKFwiLi9BY3Rpb25Jbml0XCIpXG52YXIgTW9kaWZpZXJJbml0ID0gcmVxdWlyZShcIi4vTW9kaWZpZXJJbml0XCIpXG52YXIgRXZlbnQgPSByZXF1aXJlKFwiLi9FdmVudFwiKVxudmFyIE1vZGlmaWVyID0gcmVxdWlyZShcIi4vTW9kaWZpZXJcIilcbnZhciBDaGlsZCA9IHJlcXVpcmUoXCIuL0NoaWxkXCIpXG52YXIgQWN0aW9uID0gcmVxdWlyZShcIi4vQWN0aW9uXCIpXG5cbnZhciBWaWV3ID0gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHtcbiAgaW5jbHVkZTogW1JhZGlvXSxcblxuICBleHRlbnNpb25zOiB7XG4gICAgbGF5b3V0czogbmV3IENhY2hlRXh0ZW5zaW9uKCksXG4gICAgbW9kZWxzOiBuZXcgQ2FjaGVFeHRlbnNpb24oKSxcbiAgICBldmVudHM6IG5ldyBJbnN0YW5jZUV4dGVuc2lvbihmdW5jdGlvbiAodmlldywgbmFtZSwgaW5pdCkge1xuICAgICAgdmFyIGV2ZW50XG4gICAgICBpZiAoIShpbml0IGluc3RhbmNlb2YgRXZlbnRJbml0KSkge1xuICAgICAgICBpbml0ID0gbmV3IEV2ZW50SW5pdChpbml0KVxuICAgICAgfVxuICAgICAgZXZlbnQgPSBuZXcgRXZlbnQoaW5pdClcblxuICAgICAgaWYgKHR5cGVvZiBldmVudC5oYW5kbGVyID09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHZpZXdbZXZlbnQuaGFuZGxlcl0gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGV2ZW50LmhhbmRsZXIgPSB2aWV3W2V2ZW50LmhhbmRsZXJdLmJpbmQodmlldylcbiAgICAgIH1cblxuICAgICAgaWYgKHZpZXcudmlld05hbWUpIHtcbiAgICAgICAgZXZlbnQuaW5pdGlhbGl6ZSh2aWV3LCB2aWV3LnZpZXdOYW1lKVxuICAgICAgfVxuXG4gICAgICB2aWV3Ll9ldmVudHNbbmFtZV0gPSBldmVudFxuICAgIH0pLFxuICAgIGFjdGlvbnM6IG5ldyBJbnN0YW5jZUV4dGVuc2lvbihmdW5jdGlvbiAodmlldywgbmFtZSwgaW5pdCkge1xuICAgICAgaWYgKCEoaW5pdCBpbnN0YW5jZW9mIEFjdGlvbkluaXQpKSB7XG4gICAgICAgIGluaXQgPSBuZXcgQWN0aW9uSW5pdChpbml0KVxuICAgICAgfVxuXG4gICAgICB2YXIgYWN0aW9uID0gbmV3IEFjdGlvbihpbml0KVxuICAgICAgYWN0aW9uLmluaXRpYWxpemUobmFtZSwgdmlldy52aWV3TmFtZSlcblxuICAgICAgaWYgKHR5cGVvZiBhY3Rpb24uaGFuZGxlciA9PSBcInN0cmluZ1wiICYmIHR5cGVvZiB2aWV3W2FjdGlvbi5oYW5kbGVyXSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgYWN0aW9uLmhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHZpZXdbYWN0aW9uLmhhbmRsZXJdLmFwcGx5KHZpZXcsIGFyZ3VtZW50cylcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmlldy5fYWN0aW9uc1tuYW1lXSA9IGFjdGlvblxuICAgIH0pLFxuICAgIGRhdGFzZXQ6IG5ldyBDYWNoZUV4dGVuc2lvbihmdW5jdGlvbiAocHJvdG90eXBlLCBuYW1lLCBkYXRhKSB7XG4gICAgICBpZiAoIShkYXRhIGluc3RhbmNlb2YgRG9tRGF0YSkpIHtcbiAgICAgICAgZGF0YSA9IGRvbURhdGEuY3JlYXRlKG5hbWUsIGRhdGEpXG4gICAgICB9XG4gICAgICBkYXRhLm5hbWUgPSBkYXRhLm5hbWUgfHwgbmFtZVxuXG4gICAgICByZXR1cm4gZGF0YVxuICAgIH0pLFxuICAgIG1vZGlmaWVyczogbmV3IEluc3RhbmNlRXh0ZW5zaW9uKGZ1bmN0aW9uICh2aWV3LCBuYW1lLCBtb2RpZkluaXQpIHtcbiAgICAgIGlmICghKG1vZGlmSW5pdCBpbnN0YW5jZW9mIE1vZGlmaWVySW5pdCkpIHtcbiAgICAgICAgbW9kaWZJbml0ID0gbmV3IE1vZGlmaWVySW5pdChtb2RpZkluaXQpXG4gICAgICB9XG4gICAgICB2aWV3Ll9tb2RpZmllcnNbbmFtZV0gPSBuZXcgTW9kaWZpZXIobW9kaWZJbml0KVxuICAgIH0pLFxuICAgIGNoaWxkcmVuOiBuZXcgQ2FjaGVFeHRlbnNpb24oZnVuY3Rpb24ocHJvdG90eXBlLCBuYW1lLCBjaGlsZCl7XG4gICAgICBpZiAoIShjaGlsZCBpbnN0YW5jZW9mIFNlbGVjdG9yKSkge1xuICAgICAgICBjaGlsZCA9IG5ldyBDaGlsZChjaGlsZClcbiAgICAgIH1cblxuICAgICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgQ2hpbGQpIHtcbiAgICAgICAgY2hpbGQuaW5pdGlhbGl6ZShuYW1lLCBjaGlsZC52YWx1ZSB8fCBuYW1lKVxuICAgICAgfVxuXG4gICAgICBpZiAocHJvdG90eXBlLnZpZXdOYW1lKSB7XG4gICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIENoaWxkKSB7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkLmNvbnRhaW5zKGNoaWxkLm5hbWUpLnByZWZpeChwcm90b3R5cGUudmlld05hbWUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGlsZC5jb250YWlucyhjaGlsZC5uYW1lKVxuICAgIH0pLFxuICAgIGZyYWdtZW50czogbmV3IENhY2hlRXh0ZW5zaW9uKGZ1bmN0aW9uIChwcm90b3R5cGUsIG5hbWUsIGZyYWdtZW50KSB7XG4gICAgICBpZiAoIShmcmFnbWVudCBpbnN0YW5jZW9mIEZyYWdtZW50KSkge1xuICAgICAgICByZXR1cm4gbmV3IEZyYWdtZW50KGZyYWdtZW50KVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZyYWdtZW50XG4gICAgfSlcbiAgfSxcblxuICBsYXlvdXRzOiB7fSxcbiAgbW9kZWxzOiB7fSxcbiAgZXZlbnRzOiB7fSxcbiAgZGF0YXNldDoge30sXG4gIG1vZGlmaWVyczoge30sXG4gIGZyYWdtZW50czoge30sXG4gIGNoaWxkcmVuOiB7fSxcblxuICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gVmlldyggZWxlbWVudCApe1xuICAgIFJhZGlvLmNhbGwodGhpcylcbiAgICBkZWZpbmUudmFsdWUodGhpcywgXCJfZXZlbnRzXCIsIHt9KVxuICAgIGRlZmluZS52YWx1ZSh0aGlzLCBcIl9tb2RlbHNcIiwge30pXG4gICAgZGVmaW5lLnZhbHVlKHRoaXMsIFwiX2FjdGlvbnNcIiwge30pXG4gICAgZGVmaW5lLnZhbHVlKHRoaXMsIFwiX21vZGlmaWVyc1wiLCB7fSlcbiAgICBkZWZpbmUud3JpdGFibGUudmFsdWUodGhpcywgXCJfZWxlbWVudFwiLCBudWxsKVxuICAgIGRlZmluZS53cml0YWJsZS52YWx1ZSh0aGlzLCBcImN1cnJlbnRMYXlvdXRcIiwgXCJcIilcbiAgICBWaWV3LmluaXRpYWxpemUodGhpcylcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50XG4gIH0sXG5cbiAgYWNjZXNzb3I6IHtcbiAgICBlbGVtZW50OiB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHZhciBwcmV2aW91cyA9IHRoaXMuX2VsZW1lbnRcbiAgICAgICAgaWYgKHByZXZpb3VzID09IGVsZW1lbnQpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZWxlbWVudFxuICAgICAgICB0aGlzLm9uRWxlbWVudENoYW5nZShlbGVtZW50LCBwcmV2aW91cylcbiAgICAgIH1cbiAgICB9LFxuICAgIGVsZW1lbnRTZWxlY3Rvcjoge1xuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnZpZXdOYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBDaGlsZCh0aGlzLnZpZXdOYW1lKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHByb3RvdHlwZToge1xuICAgIHZpZXdOYW1lOiBcIlwiLFxuICAgIG9uRWxlbWVudENoYW5nZTogZnVuY3Rpb24gKGVsZW1lbnQsIHByZXZpb3VzKSB7XG4gICAgICB2YXIgdmlldyA9IHRoaXNcbiAgICAgIGZvckluKHRoaXMuX2V2ZW50cywgZnVuY3Rpb24gKG5hbWUsIGV2ZW50KSB7XG4gICAgICAgIGlmIChwcmV2aW91cykgZXZlbnQudW5SZWdpc3RlcihwcmV2aW91cylcbiAgICAgICAgaWYgKGVsZW1lbnQpIGV2ZW50LnJlZ2lzdGVyKGVsZW1lbnQsIHZpZXcpXG4gICAgICB9KVxuICAgICAgZm9ySW4odGhpcy5fYWN0aW9ucywgZnVuY3Rpb24gKG5hbWUsIGFjdGlvbikge1xuICAgICAgICBpZiAocHJldmlvdXMpIGFjdGlvbi51blJlZ2lzdGVyRXZlbnQocHJldmlvdXMpXG4gICAgICAgIGlmIChlbGVtZW50KSBhY3Rpb24ucmVnaXN0ZXJFdmVudChlbGVtZW50LCB2aWV3KVxuICAgICAgfSlcbiAgICAgIGZvckluKHRoaXMuX21vZGlmaWVycywgZnVuY3Rpb24gKG5hbWUsIG1vZGlmaWVyKSB7XG4gICAgICAgIG1vZGlmaWVyLnJlc2V0KGVsZW1lbnQsIHZpZXcpXG4gICAgICB9KVxuICAgICAgZm9ySW4odGhpcy5kYXRhc2V0LCBmdW5jdGlvbiAobmFtZSwgZGF0YSkge1xuICAgICAgICBpZiAoIWRhdGEuaGFzKGVsZW1lbnQpICYmIGRhdGEuZGVmYXVsdCAhPSBudWxsKSB7XG4gICAgICAgICAgZGF0YS5zZXQoZWxlbWVudCwgZGF0YS5kZWZhdWx0KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgZm9ySW4odGhpcy5jaGlsZHJlbiwgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgdmFyIGNoaWxkID0gdmlldy5jaGlsZHJlbltuYW1lXVxuICAgICAgICBpZiAoY2hpbGQgJiYgY2hpbGQuYXV0b3NlbGVjdCkge1xuICAgICAgICAgIHZpZXdbbmFtZV0gPSB2aWV3LmZpbmRDaGlsZChuYW1lKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgZm9ySW4odGhpcy5tb2RlbHMsIGZ1bmN0aW9uIChuYW1lLCBDb25zdHJ1Y3Rvcikge1xuICAgICAgICB2aWV3Ll9tb2RlbHNbbmFtZV0gPSBuZXcgQ29uc3RydWN0b3IoKVxuICAgICAgfSlcbiAgICB9LFxuICAgIG9uTGF5b3V0Q2hhbmdlOiBmdW5jdGlvbiAobGF5b3V0LCBwcmV2aW91cykge30sXG4gICAgY2hhbmdlTGF5b3V0OiBmdW5jdGlvbiggbGF5b3V0ICl7XG4gICAgICBpZiAodGhpcy5jdXJyZW50TGF5b3V0ID09IGxheW91dCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgIH1cblxuICAgICAgdmFyIGxheW91dEhhbmRsZXIgPSB0aGlzLmxheW91dHNbbGF5b3V0XVxuICAgICAgaWYgKHR5cGVvZiBsYXlvdXRIYW5kbGVyICE9IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwiSW52YWxpZCBsYXlvdXQgaGFuZGxlcjogXCIgKyBsYXlvdXQpKVxuICAgICAgfVxuXG4gICAgICB2YXIgdmlldyA9IHRoaXNcbiAgICAgIHZhciBwcmV2aW91cyA9IHZpZXcuY3VycmVudExheW91dFxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShwcmV2aW91cykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBsYXlvdXRIYW5kbGVyLmNhbGwodmlldywgcHJldmlvdXMpXG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmlldy5jdXJyZW50TGF5b3V0ID0gbGF5b3V0XG4gICAgICAgIHZpZXcub25MYXlvdXRDaGFuZ2UocHJldmlvdXMsIGxheW91dClcbiAgICAgIH0pXG4gICAgfSxcbiAgICBkaXNwYXRjaDogZnVuY3Rpb24gKHR5cGUsIGRldGFpbCwgZGVmKSB7XG4gICAgICB2YXIgZGVmaW5pdGlvbiA9IGRlZmF1bHRzKGRlZiwge1xuICAgICAgICBkZXRhaWw6IGRldGFpbCB8fCBudWxsLFxuICAgICAgICB2aWV3OiB3aW5kb3csXG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGNhbmNlbGFibGU6IHRydWVcbiAgICAgIH0pXG4gICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IHdpbmRvdy5DdXN0b21FdmVudCh0eXBlLCBkZWZpbml0aW9uKSlcbiAgICB9LFxuICAgIGdldERhdGE6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YXNldFtuYW1lXVxuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRhdGEuZ2V0KHRoaXMuZWxlbWVudClcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsXG4gICAgfSxcbiAgICBzZXREYXRhOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUsIHNpbGVudCkge1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGFzZXRbbmFtZV1cbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhLnNldCh0aGlzLmVsZW1lbnQsIHZhbHVlLCBzaWxlbnQpXG4gICAgICB9XG4gICAgfSxcbiAgICByZW1vdmVEYXRhOiBmdW5jdGlvbiAobmFtZSwgc2lsZW50KSB7XG4gICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YXNldFtuYW1lXVxuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgZGF0YS5yZW1vdmUodGhpcy5lbGVtZW50LCBzaWxlbnQpXG4gICAgICB9XG4gICAgfSxcbiAgICBoYXNEYXRhOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGFzZXRbbmFtZV1cbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhLmhhcyh0aGlzLmVsZW1lbnQpXG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9LFxuICAgIHNldE1vZGlmaWVyOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLl9tb2RpZmllcnNbbmFtZV0gJiYgdGhpcy5lbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2RpZmllcnNbbmFtZV0uc2V0KHZhbHVlLCB0aGlzLmVsZW1lbnQsIHRoaXMpXG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRNb2RpZmllcjogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIGlmICh0aGlzLl9tb2RpZmllcnNbbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZGlmaWVyc1tuYW1lXS5nZXQoKVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVtb3ZlTW9kaWZpZXI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICBpZiAodGhpcy5fbW9kaWZpZXJzW25hbWVdKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2RpZmllcnNbbmFtZV0ucmVtb3ZlKHRoaXMuZWxlbWVudCwgdGhpcylcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldE1vZGVsOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgbmFtZSA9IG5hbWUgfHwgXCJkZWZhdWx0XCJcbiAgICAgIHZhciBtb2RlbCA9IHRoaXMuX21vZGVsc1tuYW1lXVxuICAgICAgaWYgKG1vZGVsID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIGFjY2VzcyB1bmtub3duIG1vZGVsXCIpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtb2RlbFxuICAgIH0sXG4gICAgc2V0TW9kZWw6IGZ1bmN0aW9uIChuYW1lLCBtb2RlbCkge1xuICAgICAgaWYgKCFtb2RlbCkge1xuICAgICAgICBtb2RlbCA9IG5hbWVcbiAgICAgICAgbmFtZSA9IFwiZGVmYXVsdFwiXG4gICAgICB9XG4gICAgICB0aGlzLl9tb2RlbHNbbmFtZV0gPSBtb2RlbFxuICAgIH0sXG4gICAgc2V0dXBFbGVtZW50OiBmdW5jdGlvbiAocm9vdCkge1xuICAgICAgcm9vdCA9IHJvb3QgfHwgZG9jdW1lbnQuYm9keVxuICAgICAgaWYgKHJvb3QgJiYgdGhpcy5lbGVtZW50U2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy5lbGVtZW50U2VsZWN0b3IuZnJvbShyb290KS5maW5kKClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuICAgIGdldENoaWxkVmlldzogZnVuY3Rpb24gKGNoaWxkUHJvcGVydHksIGVsZW1lbnQpIHtcbiAgICAgIHZhciBjaGlsZCA9IHRoaXMuY2hpbGRyZW5bY2hpbGRQcm9wZXJ0eV1cbiAgICAgIHZhciBtZW1iZXIgPSB0aGlzW2NoaWxkUHJvcGVydHldXG5cbiAgICAgIGlmIChjaGlsZCAmJiBjaGlsZC5tdWx0aXBsZSB8fCBBcnJheS5pc0FycmF5KG1lbWJlcikpIHtcbiAgICAgICAgdmFyIGwgPSBtZW1iZXIubGVuZ3RoXG4gICAgICAgIHdoaWxlIChsLS0pIHtcbiAgICAgICAgICBpZiAobWVtYmVyW2xdLmVsZW1lbnQgPT0gZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIG1lbWJlcltsXVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtZW1iZXJcbiAgICB9LFxuICAgIGZpbmRDaGlsZDogZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICB2YXIgY2hpbGRcbiAgICAgIGlmICh0eXBlb2YgcHJvcGVydHkgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICBjaGlsZCA9IHRoaXMuY2hpbGRyZW5bcHJvcGVydHldXG4gICAgICB9XG4gICAgICBlbHNlIGlmIChwcm9wZXJ0eSBpbnN0YW5jZW9mIFNlbGVjdG9yKSB7XG4gICAgICAgIGNoaWxkID0gcHJvcGVydHlcbiAgICAgIH1cblxuICAgICAgaWYgKGNoaWxkKSB7XG4gICAgICAgIHZhciBlbGVtZW50ID0gY2hpbGQuZnJvbSh0aGlzLmVsZW1lbnQsIHRoaXMuZWxlbWVudFNlbGVjdG9yKS5maW5kKClcbiAgICAgICAgaWYgKGVsZW1lbnQgJiYgY2hpbGQubG9va3VwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q2hpbGRWaWV3KGNoaWxkLmxvb2t1cCwgZWxlbWVudClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxlbWVudFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxufSlcbiJdfQ==
