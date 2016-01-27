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