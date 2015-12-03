(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.matchboxUi = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ui = module.exports = {}

ui.data = require("matchbox-dom/data")
ui.View = require("./view/View")
ui.Child = require("./view/Child")
ui.Event = require("./view/Event")
ui.Action = require("./view/Action")
ui.Modifier = require("./view/Modifier")
ui.SwitchModifier = require("./modifier/SwitchModifier")
ui.EnumModifier = require("./modifier/EnumModifier")

},{"./modifier/EnumModifier":2,"./modifier/SwitchModifier":3,"./view/Action":36,"./view/Child":37,"./view/Event":38,"./view/Modifier":39,"./view/View":40,"matchbox-dom/data":12}],2:[function(require,module,exports){
var inherit = require("matchbox-factory/inherit")
var Modifier = require("../view/Modifier")

module.exports = EnumModifier

function EnumModifier (defaultValue, values, animationDuration) {
  if (!(this instanceof EnumModifier)) {
    return new EnumModifier(defaultValue, values, animationDuration)
  }

  Modifier.call(this, {
    type: "enum",
    default: defaultValue,
    values: values,
    animationDuration: animationDuration
  })
}

inherit(EnumModifier, Modifier)

},{"../view/Modifier":39,"matchbox-factory/inherit":25}],3:[function(require,module,exports){
var inherit = require("matchbox-factory/inherit")
var Modifier = require("../view/Modifier")

module.exports = SwitchModifier

function SwitchModifier (defaultValue, on, off, animationDuration) {
  if (!(this instanceof SwitchModifier)) {
    return new SwitchModifier(defaultValue, on, off, animationDuration)
  }

  Modifier.call(this, {
    type: "switch",
    default: defaultValue,
    on: on,
    off: off,
    animationDuration: animationDuration
  })
}

inherit(SwitchModifier, Modifier)

},{"../view/Modifier":39,"matchbox-factory/inherit":25}],4:[function(require,module,exports){
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


},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"../Data":4,"matchbox-factory/inherit":14}],8:[function(require,module,exports){
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

},{"../Data":4,"matchbox-factory/inherit":14}],9:[function(require,module,exports){
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

},{"../Data":4,"matchbox-factory/inherit":14}],10:[function(require,module,exports){
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

},{"../Data":4,"matchbox-factory/inherit":14}],11:[function(require,module,exports){
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

},{"../Data":4,"matchbox-factory/inherit":14}],12:[function(require,module,exports){
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

},{"./BooleanData":7,"./FloatData":8,"./JSONData":9,"./NumberData":10,"./StringData":11}],13:[function(require,module,exports){
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

},{"../Selector":6}],14:[function(require,module,exports){
module.exports = function inherit (Class, Base) {
  Class.prototype = Object.create(Base.prototype)
  Class.prototype.constructor = Class

  return Class
}

},{}],15:[function(require,module,exports){
var merge = require("matchbox-util/object/merge")
var forIn = require("matchbox-util/object/in")
var Extension = require("./Extension")

module.exports = Blueprint

function Blueprint( blocks, parent ){
  var blueprint = this

  this.blocks = merge(blocks)
  this.parent = parent

  this.localExtensions = this.get("extensions", {})

  forIn(this.localExtensions, function( name, extension ){
    //if (parent && !!~parent.extensionNames.indexOf(name)) {
    //  throw new Error("Description override is not supported")
    //}

    extension = extension instanceof Extension
        ? extension
        : new Extension(extension)
    blueprint.localExtensions[name] = extension
    extension.name = name
  })

  this.globalExtensions = this.localExtensions

  if (parent) {
    this.globalExtensions = merge(parent.globalExtensions, this.localExtensions)
    forIn(this.globalExtensions, function (name, extension) {
      if (extension.inherit) {
        blueprint.blocks[name] = merge(parent.get(name), blueprint.get(name))
      }
    })
  }
}

Blueprint.prototype.buildPrototype = function( prototype, top ){
  this.build("prototype", this.globalExtensions, top, function (name, extension, block) {
    forIn(block, function( name, value ){
      extension.initialize(prototype, name, value)
    })
  })
}

Blueprint.prototype.buildCache = function( prototype, top ){
  this.build("cache", this.globalExtensions, top, function (name, extension, block) {
    if (!prototype.hasOwnProperty(name)) {
      prototype[name] = {}
    }

    var cache = prototype[name]
    var initialize = extension.initialize

    forIn(block, function( name, value ){
      cache[name] = initialize
          ? initialize(prototype, name, value)
          : value
    })
  })
}

Blueprint.prototype.buildInstance = function( instance, top ){
  this.build("instance", this.localExtensions, top, function (name, extension, block) {
    forIn(block, function( name, value ){
      extension.initialize(instance, name, value)
    })
  })
}

Blueprint.prototype.build = function( type, extensions, top, build ){
  var blueprint = top || this
  //var base = this
  forIn(extensions, function (name, extension) {
    if( extension.type != type ) return
    //var blueprint = extension.inherit ? top : base
    var block = blueprint.get(name)
    if( !block ) return

    build(name, extension, block)
  })
}

Blueprint.prototype.digest = function( name, fn, loop ){
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

Blueprint.prototype.has = function( name ){
  return this.blocks.hasOwnProperty(name) && this.blocks[name] != null
}

Blueprint.prototype.get = function( name, defaultValue ){
  if( this.has(name) ){
    return this.blocks[name]
  }
  else return defaultValue
}

},{"./Extension":17,"matchbox-util/object/in":34,"matchbox-util/object/merge":35}],16:[function(require,module,exports){
var inherit = require("./inherit")
var Extension = require("./Extension")

module.exports = CacheExtension

function CacheExtension (initialize) {
  Extension.call(this, {
    type: "cache",
    inherit: true,
    initialize: initialize
  })
}

inherit(CacheExtension, Extension)

},{"./Extension":17,"./inherit":25}],17:[function(require,module,exports){
module.exports = Extension

function Extension(extension){
  extension = extension || {}
  this.name = ""
  this.type = extension.type || "instance"
  this.inherit = extension.inherit || false
  this.initialize = extension.initialize || null
}

},{}],18:[function(require,module,exports){
var define = require("matchbox-util/object/define")
var extendObject = require("matchbox-util/object/extend")
var Blueprint = require("./Blueprint")
var extend = require("./extend")
var augment = require("./augment")
var include = require("./include")
var inherit = require("./inherit")

module.exports = Factory

function Factory( blueprint, parent ){
  var factory = this

  if( !(blueprint instanceof Blueprint) ) {
    blueprint = new Blueprint(blueprint, parent ? parent.blueprint : null)
  }

  this.blueprint = blueprint
  this.parent = parent || null
  this.ancestors = parent ? parent.ancestors.concat([parent]) : []
  this.root = this.ancestors[0] || null
  this.Super = blueprint.get("inherit", null)
  this.Constructor = blueprint.get("constructor", function () {
    if (factory.Super) {
      factory.Super.apply(this, arguments)
    }
    this.constructor.initialize(this)
  })
  this.Constructor.extend = function (superBlueprint) {
    superBlueprint = superBlueprint || {}
    superBlueprint["inherit"] = factory.Constructor
    var superFactory = new Factory(superBlueprint, factory)
    return superFactory.assemble()
  }

  this.industry.push(this)
}

Factory.prototype.assemble = function(){
  var factory = this
  var blueprint = this.blueprint
  var Constructor = this.Constructor

  Constructor.Super = this.Super
  Constructor.blueprint = blueprint

  this.digest()

  blueprint.buildPrototype(Constructor.prototype, blueprint)
  blueprint.buildCache(Constructor.prototype, blueprint)

  Constructor.initialize = function (instance) {
    //var top = factory.findFactory(instance.constructor).blueprint
    var top = instance.constructor.blueprint
    blueprint.buildInstance(instance, top)
  }

  return Constructor
}

Factory.prototype.digest = function(  ){
  var factory = this
  var blueprint = this.blueprint
  var Constructor = this.Constructor
  var proto = Constructor.prototype

  blueprint.digest("inherit", function (Super) {
    inherit(Constructor, Super)
  })
  blueprint.digest("include", function (includes) {
    include(Constructor, includes)
  })
  blueprint.digest("augment", function (augments) {
    augment(Constructor, augments)
  })
  blueprint.digest("prototype", function (proto) {
    extend(Constructor, proto)
  })
  if (blueprint.parent) {
    extendObject(Constructor, blueprint.parent.get("static"))
  }
  blueprint.digest("static", function (methods) {
    extendObject(Constructor, methods)
  })
  blueprint.digest("accessor", function( name, access ){
    if( !access ) return
    if( typeof access == "function" ){
      define.getter(proto, name, access)
    }
    else if( typeof access["get"] == "function" && typeof access["set"] == "function" ){
      define.accessor(proto, name, access["get"], access["set"])
    }
    else if( typeof access["get"] == "function" ){
      define.getter(proto, name, access["get"])
    }
    else if( typeof access["set"] == "function" ){
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

Factory.prototype.findFactory = function( Constructor ){
  var ret = null
  this.industry.some(function (factory) {
    return factory.Constructor === Constructor && (ret = factory)
  })
  return ret
}

},{"./Blueprint":15,"./augment":21,"./extend":22,"./include":23,"./inherit":25,"matchbox-util/object/define":32,"matchbox-util/object/extend":33}],19:[function(require,module,exports){
var inherit = require("./inherit")
var Extension = require("./Extension")

module.exports = InstanceExtension

function InstanceExtension (initialize) {
  Extension.call(this, {
    type: "instance",
    inherit: true,
    initialize: initialize
  })
}

inherit(InstanceExtension, Extension)

},{"./Extension":17,"./inherit":25}],20:[function(require,module,exports){
var inherit = require("./inherit")
var Extension = require("./Extension")

module.exports = PrototypeExtension

function PrototypeExtension (initialize) {
  Extension.call(this, {
    type: "prototype",
    inherit: false,
    initialize: initialize
  })
}

inherit(PrototypeExtension, Extension)

},{"./Extension":17,"./inherit":25}],21:[function(require,module,exports){
module.exports = function augment (Class, mixin) {
  if (Array.isArray(mixin)) {
    mixin.forEach(function (mixin) {
      if (typeof mixin == "function") {
        mixin.call(Class.prototype)
      }
    })
  }
  else {
    if (typeof mixin == "function") {
      mixin.call(Class.prototype)
    }
  }

  return Class
}

},{}],22:[function(require,module,exports){
module.exports = function extend (Class, prototype) {
  Object.getOwnPropertyNames(prototype).forEach(function (name) {
    if (name !== "constructor" ) {
      var descriptor = Object.getOwnPropertyDescriptor(prototype, name)
      Object.defineProperty(Class.prototype, name, descriptor)
    }
  })

  return Class
}

},{}],23:[function(require,module,exports){
var extend = require("./extend")

module.exports = function include (Class, Other) {
  if (Array.isArray(Other)) {
    Other.forEach(function (Other) {
      if (typeof Other == "function") {
        extend(Class, Other.prototype)
      }
      else if (typeof Other == "object") {
        extend(Class, Other)
      }
    })
  }
  else {
    if (typeof Other == "function") {
      extend(Class, Other.prototype)
    }
    else if (typeof Other == "object") {
      extend(Class, Other)
    }
  }

  return Class
}

},{"./extend":22}],24:[function(require,module,exports){
var Factory = require("./Factory")

module.exports = factory

factory.CacheExtension = require("./CacheExtension")
factory.InstanceExtension = require("./InstanceExtension")
factory.PrototypeExtension = require("./PrototypeExtension")

function factory( blueprint ){
  return new Factory(blueprint).assemble()
}

},{"./CacheExtension":16,"./Factory":18,"./InstanceExtension":19,"./PrototypeExtension":20}],25:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"dup":14}],26:[function(require,module,exports){
module.exports = Channel

function Channel( name ){
  this.name = name || ""
}

Channel.prototype = []
Channel.prototype.constructor = Channel

Channel.prototype.publish = Channel.prototype.broadcast = function(  ){
  var listeners = this.slice()
  var l = listeners.length
  if( !l ){
    return false
  }

  var err = null
  var i = -1
  var listener

  while( ++i < l ){
    listener = listeners[i]
    if( listener.proxy ) listener = listener.proxy
    err = listener.apply(null, arguments)
    if( err != null ) return err
  }

  return false
}
Channel.prototype.subscribe = function( listener ){
  if( typeof listener != "function" ){
    console.warn("Listener is not a function", listener)
    return this
  }

  if( !this.isSubscribed(listener) ) {
    this.push(listener)
  }

  return this
}
Channel.prototype.unsubscribe = function( listener ){
  var i = this.indexOf(listener)
  if( ~i ) this.splice(i, 1)
  return this
}
Channel.prototype.peek = function( listener ){
  var channel = this

  // piggyback on the listener
  listener.proxy = function proxy(  ){
    var ret = listener.apply(null, arguments)
    channel.unsubscribe(listener)
    return ret
  }
  this.subscribe(listener)

  return this
}
Channel.prototype.isSubscribed = function( listener ){
  return !!(listener && ~this.indexOf(listener))
}
Channel.prototype.hasSubscribers = function(  ){
  return this.length > 0
}
Channel.prototype.empty = function(){
  this.splice(0)
  return this
}

},{}],27:[function(require,module,exports){
var Channel = require("./Channel")

module.exports = Radio

function Radio(  ){
  this._channels = []
}

/**
 * Create a channel if it doesn't exist already
 * and return the channel.
 * */
Radio.prototype.channel = function( channel ){
  return this._channels[channel]
      || (this._channels[channel] = new Channel(channel))
}
/**
 * Check if a channel exists.
 * */
Radio.prototype.channelExists = function( channel ){
  return !!channel && (typeof channel == "string"
          ? this._channels.hasOwnProperty(channel)
          : this._channels.hasOwnProperty(channel.name))
}
/**
 * Delete a channel.
 * */
Radio.prototype.deleteChannel = function( channel ){
  if( channel instanceof Channel ){
    return delete this._channels[channel.name]
  }
  return delete this._channels[channel]
}
/**
 * Check if a channel has any subscribers.
 * If the channel doesn't exists it's `false`.
 * */
Radio.prototype.hasSubscribers = function( channel ){
  return this.channelExists(channel) && this.channel(channel).hasSubscribers()
}
/**
 * Check if a listener is subscribed to a channel.
 * If the channel doesn't exists it's `false`.
 * */
Radio.prototype.isSubscribed = function( channel, listener ){
  return this.channelExists(channel) && this.channel(channel).isSubscribed(listener)
}
/**
 * Send arguments on a channel.
 * If the channel doesn't exists nothing happens.
 * */
Radio.prototype.publish = Radio.prototype.broadcast = function( channel ){
  if( this.channelExists(channel) ){
    channel = this.channel(channel)
    var args = [].slice.call(arguments, 1)
    return channel.broadcast.apply(channel, args)
  }
  return false
}
/**
 * Subscribe to a channel with a listener.
 * It also creates the channel if it doesn't exists yet.
 * */
Radio.prototype.subscribe = function( channel, listener ){
  this.channel(channel).subscribe(listener)
  return this
}
/**
 * Unsubscribe a listener from a channel.
 * If the channel doesn't exists nothing happens.
 * */
Radio.prototype.unsubscribe = function( channel, listener ){
  if( this.channelExists(channel) ) {
    this.channel(channel).unsubscribe(listener)
  }
  return this
}
/**
 * Subscribe a listener to a channel
 * that unsubscribes after the first broadcast it receives.
 * It also creates the channel if it doesn't exists yet.
 * */
Radio.prototype.peek = function( channel, listener ){
  this.channel(channel).peek(listener)
  return this
}
/**
 * Empty a channel removing every subscriber it holds,
 * but not deleting the channel itself.
 * If the channel doesn't exists nothing happens.
 * */
Radio.prototype.emptyChannel = function( channel ){
  if( this.channelExists(channel) ) {
    this.channel(channel).empty()
  }
  return this
}

},{"./Channel":26}],28:[function(require,module,exports){
var Radio = require("./Radio")
var Channel = require("./Channel")

module.exports = Radio
module.exports.Channel = Channel

},{"./Channel":26,"./Radio":27}],29:[function(require,module,exports){
module.exports = Descriptor

var _writable = "_writable"
var _enumerable = "_enumerable"
var _configurable = "_configurable"

function Descriptor( writable, enumerable, configurable ){
  this.value(this, _writable, writable || false)
  this.value(this, _enumerable, enumerable || false)
  this.value(this, _configurable, configurable || false)

  this.getter(this, "w", function () { return this.writable })
  this.getter(this, "writable", function () {
    return new Descriptor(true, enumerable, configurable)
  })

  this.getter(this, "e", function () { return this.enumerable })
  this.getter(this, "enumerable", function () {
    return new Descriptor(writable, true, configurable)
  })

  this.getter(this, "c", function () { return this.configurable })
  this.getter(this, "configurable", function () {
    return new Descriptor(writable, enumerable, true)
  })
}

Descriptor.prototype = {
  accessor: function( obj, name, getter, setter ){
    Object.defineProperty(obj, name, {
      enumerable: this[_enumerable],
      configurable: this[_configurable],
      get: getter,
      set: setter
    })
    return this
  },
  getter: function( obj, name, fn ){
    Object.defineProperty(obj, name, {
      enumerable: this[_enumerable],
      configurable: this[_configurable],
      get: fn
    })
    return this
  },
  setter: function( obj, name, fn ){
    Object.defineProperty(obj, name, {
      enumerable: this[_enumerable],
      configurable: this[_configurable],
      set: fn
    })
    return this
  },
  value: function( obj, name, value ){
    Object.defineProperty(obj, name, {
      writable: this[_writable],
      enumerable: this[_enumerable],
      configurable: this[_configurable],
      value: value
    })
    return this
  },
  method: function( obj, name, fn ){
    Object.defineProperty(obj, name, {
      writable: this[_writable],
      enumerable: false,
      configurable: this[_configurable],
      value: fn
    })
    return this
  },
  property: function( obj, name, value ){
    Object.defineProperty(obj, name, {
      writable: this[_writable],
      enumerable: false,
      configurable: this[_configurable],
      value: value
    })
    return this
  },
  constant: function( obj, name, value ){
    Object.defineProperty(obj, name, {
      writable: false,
      enumerable: false,
      configurable: false,
      value: value
    })
    return this
  }
}

},{}],30:[function(require,module,exports){
var extend = require("./extend")

module.exports = function (obj) {
  return extend({}, obj)
}

},{"./extend":33}],31:[function(require,module,exports){
var copy = require("./copy")

module.exports = function defaults (options, defaults) {
  if (!options) {
    return copy(defaults)
  }

  var obj = copy(options)

  for (var prop in defaults) {
    if (defaults.hasOwnProperty(prop) && !options.hasOwnProperty(prop)) {
      obj[prop] = defaults[prop]
    }
  }

  return obj
}

},{"./copy":30}],32:[function(require,module,exports){
var Descriptor = require("./Descriptor")

module.exports = new Descriptor()

},{"./Descriptor":29}],33:[function(require,module,exports){
module.exports = function extend( obj, extension ){
  for( var name in extension ){
    if( extension.hasOwnProperty(name) ) obj[name] = extension[name]
  }
  return obj
}

},{}],34:[function(require,module,exports){
module.exports = function( obj, callback ){
  for( var prop in obj ){
    if( obj.hasOwnProperty(prop) ){
      callback(prop, obj[prop], obj)
    }
  }
  return obj
}

},{}],35:[function(require,module,exports){
var extend = require("./extend")

module.exports = function( obj, extension ){
  return extend(extend({}, obj), extension)
}

},{"./extend":33}],36:[function(require,module,exports){
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

  this.lookup = null

  switch (arguments.length) {
    case 1:
      this.event = new Event(event)
      this.lookup = event.lookup || null
      break
    case 2:
      this.event = new Event(event, target)
      break
    case 3:
      this.event = new Event(event, target, handler)
      break
  }
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

},{"./Child":37,"./Event":38,"matchbox-dom/Selector":6,"matchbox-factory/include":23,"matchbox-factory/inherit":25}],37:[function(require,module,exports){
var inherit = require("matchbox-factory/inherit")
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

},{"matchbox-dom/Selector":6,"matchbox-factory/inherit":25}],38:[function(require,module,exports){
var delegate = require("matchbox-dom/event/delegate")

module.exports = Event

function Event (event, target, capture, once, handler) {
  if (!(this instanceof Event)) {
    return new Event(event, target, capture, once, handler)
  }

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

},{"matchbox-dom/event/delegate":13}],39:[function(require,module,exports){
module.exports = Modifier

function Modifier (modifier) {
  if (!(this instanceof Modifier)) {
    return new Modifier(modifier)
  }

  this.type = modifier.type
  this.default = modifier.default == null ? null : modifier.default
  this.values = []
  this.value = null
  this.onchange = null
  this.animationDuration = modifier.animationDuration || 0
  this.timerId = null
  switch (this.type) {
    case "switch":
      this.values.push(modifier.on && typeof modifier.on == "string" ? modifier.on : null)
      this.values.push(modifier.off && typeof modifier.off == "string" ? modifier.off : null)
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

},{}],40:[function(require,module,exports){
var define = require("matchbox-util/object/define")
var defaults = require("matchbox-util/object/defaults")
var forIn = require("matchbox-util/object/in")
var factory = require("matchbox-factory")
var InstanceExtension = require("matchbox-factory/InstanceExtension")
var CacheExtension = require("matchbox-factory/CacheExtension")
var DomData = require("matchbox-dom/Data")
var domData = require("matchbox-dom/data")
var Selector = require("matchbox-dom/Selector")
var Radio = require("matchbox-radio")
var Fragment = require("matchbox-dom/Fragment")
var Event = require("./Event")
var Modifier = require("./Modifier")
var Child = require("./Child")
var Action = require("./Action")

var View = module.exports = factory({
  include: [Radio],

  extensions: {
    layouts: new CacheExtension(),
    models: new CacheExtension(),
    events: new InstanceExtension(function (view, name, event) {
      if (!(event instanceof Event)) {
        event = new Event(event)
      }
      if (typeof event.handler == "string" && typeof view[event.handler] == "function") {
        event.handler = view[event.handler].bind(view)
      }
      view._events[name] = event
    }),
    actions: new InstanceExtension(function (view, name, action) {
      if (!(action instanceof Action)) {
        action = new Action(action)
      }
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
    modifiers: new InstanceExtension(function (view, name, modifier) {
      if (!(modifier instanceof Modifier)) {
        modifier = new Modifier(modifier)
      }
      view._modifiers[name] = modifier
    }),
    children: new CacheExtension(function(prototype, name, child){
      if (!(child instanceof Selector)) {
        child = new Child(child)
      }

      child.initialize(name, child.value || name)

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
      var child = this.children[property]
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

},{"./Action":36,"./Child":37,"./Event":38,"./Modifier":39,"matchbox-dom/Data":4,"matchbox-dom/Fragment":5,"matchbox-dom/Selector":6,"matchbox-dom/data":12,"matchbox-factory":24,"matchbox-factory/CacheExtension":16,"matchbox-factory/InstanceExtension":19,"matchbox-radio":28,"matchbox-util/object/defaults":31,"matchbox-util/object/define":32,"matchbox-util/object/in":34}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm1vZGlmaWVyL0VudW1Nb2RpZmllci5qcyIsIm1vZGlmaWVyL1N3aXRjaE1vZGlmaWVyLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWRvbS9EYXRhLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWRvbS9GcmFnbWVudC5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1kb20vU2VsZWN0b3IuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZG9tL2RhdGEvQm9vbGVhbkRhdGEuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZG9tL2RhdGEvRmxvYXREYXRhLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWRvbS9kYXRhL0pTT05EYXRhLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWRvbS9kYXRhL051bWJlckRhdGEuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZG9tL2RhdGEvU3RyaW5nRGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1kb20vZGF0YS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1kb20vZXZlbnQvZGVsZWdhdGUuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZG9tL25vZGVfbW9kdWxlcy9tYXRjaGJveC1mYWN0b3J5L2luaGVyaXQuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZmFjdG9yeS9CbHVlcHJpbnQuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZmFjdG9yeS9DYWNoZUV4dGVuc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1mYWN0b3J5L0V4dGVuc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1mYWN0b3J5L0ZhY3RvcnkuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZmFjdG9yeS9JbnN0YW5jZUV4dGVuc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1mYWN0b3J5L1Byb3RvdHlwZUV4dGVuc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1mYWN0b3J5L2F1Z21lbnQuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZmFjdG9yeS9leHRlbmQuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZmFjdG9yeS9pbmNsdWRlLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWZhY3RvcnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtcmFkaW8vQ2hhbm5lbC5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1yYWRpby9SYWRpby5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1yYWRpby9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC11dGlsL29iamVjdC9EZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LXV0aWwvb2JqZWN0L2NvcHkuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtdXRpbC9vYmplY3QvZGVmYXVsdHMuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtdXRpbC9vYmplY3QvZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LXV0aWwvb2JqZWN0L2V4dGVuZC5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC11dGlsL29iamVjdC9pbi5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC11dGlsL29iamVjdC9tZXJnZS5qcyIsInZpZXcvQWN0aW9uLmpzIiwidmlldy9DaGlsZC5qcyIsInZpZXcvRXZlbnQuanMiLCJ2aWV3L01vZGlmaWVyLmpzIiwidmlldy9WaWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHVpID0gbW9kdWxlLmV4cG9ydHMgPSB7fVxuXG51aS5kYXRhID0gcmVxdWlyZShcIm1hdGNoYm94LWRvbS9kYXRhXCIpXG51aS5WaWV3ID0gcmVxdWlyZShcIi4vdmlldy9WaWV3XCIpXG51aS5DaGlsZCA9IHJlcXVpcmUoXCIuL3ZpZXcvQ2hpbGRcIilcbnVpLkV2ZW50ID0gcmVxdWlyZShcIi4vdmlldy9FdmVudFwiKVxudWkuQWN0aW9uID0gcmVxdWlyZShcIi4vdmlldy9BY3Rpb25cIilcbnVpLk1vZGlmaWVyID0gcmVxdWlyZShcIi4vdmlldy9Nb2RpZmllclwiKVxudWkuU3dpdGNoTW9kaWZpZXIgPSByZXF1aXJlKFwiLi9tb2RpZmllci9Td2l0Y2hNb2RpZmllclwiKVxudWkuRW51bU1vZGlmaWVyID0gcmVxdWlyZShcIi4vbW9kaWZpZXIvRW51bU1vZGlmaWVyXCIpXG4iLCJ2YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCJtYXRjaGJveC1mYWN0b3J5L2luaGVyaXRcIilcbnZhciBNb2RpZmllciA9IHJlcXVpcmUoXCIuLi92aWV3L01vZGlmaWVyXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gRW51bU1vZGlmaWVyXG5cbmZ1bmN0aW9uIEVudW1Nb2RpZmllciAoZGVmYXVsdFZhbHVlLCB2YWx1ZXMsIGFuaW1hdGlvbkR1cmF0aW9uKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBFbnVtTW9kaWZpZXIpKSB7XG4gICAgcmV0dXJuIG5ldyBFbnVtTW9kaWZpZXIoZGVmYXVsdFZhbHVlLCB2YWx1ZXMsIGFuaW1hdGlvbkR1cmF0aW9uKVxuICB9XG5cbiAgTW9kaWZpZXIuY2FsbCh0aGlzLCB7XG4gICAgdHlwZTogXCJlbnVtXCIsXG4gICAgZGVmYXVsdDogZGVmYXVsdFZhbHVlLFxuICAgIHZhbHVlczogdmFsdWVzLFxuICAgIGFuaW1hdGlvbkR1cmF0aW9uOiBhbmltYXRpb25EdXJhdGlvblxuICB9KVxufVxuXG5pbmhlcml0KEVudW1Nb2RpZmllciwgTW9kaWZpZXIpXG4iLCJ2YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCJtYXRjaGJveC1mYWN0b3J5L2luaGVyaXRcIilcbnZhciBNb2RpZmllciA9IHJlcXVpcmUoXCIuLi92aWV3L01vZGlmaWVyXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gU3dpdGNoTW9kaWZpZXJcblxuZnVuY3Rpb24gU3dpdGNoTW9kaWZpZXIgKGRlZmF1bHRWYWx1ZSwgb24sIG9mZiwgYW5pbWF0aW9uRHVyYXRpb24pIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFN3aXRjaE1vZGlmaWVyKSkge1xuICAgIHJldHVybiBuZXcgU3dpdGNoTW9kaWZpZXIoZGVmYXVsdFZhbHVlLCBvbiwgb2ZmLCBhbmltYXRpb25EdXJhdGlvbilcbiAgfVxuXG4gIE1vZGlmaWVyLmNhbGwodGhpcywge1xuICAgIHR5cGU6IFwic3dpdGNoXCIsXG4gICAgZGVmYXVsdDogZGVmYXVsdFZhbHVlLFxuICAgIG9uOiBvbixcbiAgICBvZmY6IG9mZixcbiAgICBhbmltYXRpb25EdXJhdGlvbjogYW5pbWF0aW9uRHVyYXRpb25cbiAgfSlcbn1cblxuaW5oZXJpdChTd2l0Y2hNb2RpZmllciwgTW9kaWZpZXIpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IERvbURhdGFcblxuZnVuY3Rpb24gRG9tRGF0YSAobmFtZSwgZGVmYXVsdFZhbHVlLCBvbkNoYW5nZSkge1xuICB0aGlzLm5hbWUgPSBuYW1lXG4gIHRoaXMub25DaGFuZ2UgPSBvbkNoYW5nZSB8fCBudWxsXG4gIHRoaXMuZGVmYXVsdCA9IGRlZmF1bHRWYWx1ZSA9PSBudWxsID8gbnVsbCA6IGRlZmF1bHRWYWx1ZVxufVxuXG5Eb21EYXRhLnByb3RvdHlwZS50eXBlID0gXCJcIlxuXG5Eb21EYXRhLnByb3RvdHlwZS5hdHRyaWJ1dGVOYW1lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gXCJkYXRhLVwiK3RoaXMubmFtZVxufVxuRG9tRGF0YS5wcm90b3R5cGUuY2hlY2tUeXBlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsXG59XG5cbkRvbURhdGEucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZVxufVxuXG5Eb21EYXRhLnByb3RvdHlwZS5zdHJpbmdpZnkgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIFwiXCIrdmFsdWVcbn1cblxuRG9tRGF0YS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgdmFyIGF0dHJpYnV0ZU5hbWUgPSB0aGlzLmF0dHJpYnV0ZU5hbWUoKVxuICBpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSkpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZShlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKSlcbiAgfVxuXG4gIHJldHVybiB0aGlzLmRlZmF1bHRcbn1cblxuRG9tRGF0YS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlLCBjb250ZXh0LCBzaWxlbnQpIHtcbiAgaWYgKCF0aGlzLmNoZWNrVHlwZSh2YWx1ZSkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2FuJ3Qgc2V0IERvbURhdGEgXCIrdGhpcy50eXBlK1wiIHRvICdcIit2YWx1ZStcIidcIilcbiAgfVxuXG4gIHZhciBhdHRyaWJ1dGVOYW1lID0gdGhpcy5hdHRyaWJ1dGVOYW1lKClcblxuICB2YXIgaGFzVmFsdWUgPSBlbGVtZW50Lmhhc0F0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKVxuICB2YXIgbmV3U3RyaW5nVmFsdWUgPSB0aGlzLnN0cmluZ2lmeSh2YWx1ZSlcbiAgdmFyIHByZXZTdHJpbmdWYWx1ZSA9IGhhc1ZhbHVlID8gZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSkgOiBudWxsXG5cbiAgaWYgKG5ld1N0cmluZ1ZhbHVlID09PSBwcmV2U3RyaW5nVmFsdWUpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUsIG5ld1N0cmluZ1ZhbHVlKVxuXG4gIGlmICghc2lsZW50KSB7XG4gICAgdmFyIG9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZVxuICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgdmFyIHByZXZpb3VzVmFsdWUgPSBoYXNWYWx1ZSA/IHRoaXMucGFyc2UocHJldlN0cmluZ1ZhbHVlKSA6IG51bGxcbiAgICAgIG9uQ2hhbmdlLmNhbGwoY29udGV4dCwgcHJldmlvdXNWYWx1ZSwgdmFsdWUpXG4gICAgfVxuICB9XG59XG5cbkRvbURhdGEucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHJldHVybiBlbGVtZW50Lmhhc0F0dHJpYnV0ZSh0aGlzLmF0dHJpYnV0ZU5hbWUoKSlcbn1cblxuRG9tRGF0YS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRleHQsIHNpbGVudCkge1xuICB2YXIgYXR0cmlidXRlTmFtZSA9IHRoaXMuYXR0cmlidXRlTmFtZSgpXG4gIGlmICghZWxlbWVudC5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSkpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBwcmV2aW91c1ZhbHVlID0gZWxlbWVudC5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSlcbiAgICAgID8gdGhpcy5wYXJzZShlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKSlcbiAgICAgIDogbnVsbFxuXG4gIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpXG5cbiAgaWYgKCFzaWxlbnQpIHtcbiAgICB2YXIgb25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlXG4gICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICBvbkNoYW5nZS5jYWxsKGNvbnRleHQsIHByZXZpb3VzVmFsdWUsIG51bGwpXG4gICAgfVxuICB9XG59XG5cbiIsIm1vZHVsZS5leHBvcnRzID0gRnJhZ21lbnRcblxuZnVuY3Rpb24gRnJhZ21lbnQgKGZyYWdtZW50KSB7XG4gIGZyYWdtZW50ID0gZnJhZ21lbnQgfHwge31cbiAgdGhpcy5odG1sID0gZnJhZ21lbnQuaHRtbCB8fCBcIlwiXG4gIHRoaXMuZmlyc3QgPSBmcmFnbWVudC5maXJzdCA9PSB1bmRlZmluZWQgfHwgISFmcmFnbWVudC5maXJzdFxuICB0aGlzLnRpbWVvdXQgPSBmcmFnbWVudC50aW1lb3V0IHx8IDIwMDBcbn1cblxuRnJhZ21lbnQucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uIChodG1sKSB7XG4gIHZhciB0ZW1wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICB0ZW1wLmlubmVySFRNTCA9IGh0bWwgfHwgdGhpcy5odG1sXG5cbiAgaWYgKHRoaXMuZmlyc3QgPT09IHVuZGVmaW5lZCB8fCB0aGlzLmZpcnN0KSB7XG4gICAgcmV0dXJuIHRlbXAuY2hpbGRyZW5bMF1cbiAgfVxuXG4gIHZhciBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuICB3aGlsZSAodGVtcC5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKHRlbXAuZmlyc3RDaGlsZClcbiAgfVxuXG4gIHJldHVybiBmcmFnbWVudDtcbn1cblxuRnJhZ21lbnQucHJvdG90eXBlLmNvbXBpbGUgPSBmdW5jdGlvbiAoaHRtbCwgb3B0aW9ucywgY2IpIHtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgY2IobnVsbCwgaHRtbClcbiAgfSwgNClcbn1cblxuRnJhZ21lbnQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciBmcmFnbWVudCA9IHRoaXNcbiAgY29udGV4dCA9IGNvbnRleHQgfHwge31cblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXNvbHZlZCA9IGZhbHNlXG4gICAgdmFyIGlkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICByZWplY3QobmV3IEVycm9yKFwiUmVuZGVyIHRpbWVkIG91dFwiKSlcbiAgICB9LCBmcmFnbWVudC50aW1lb3V0KVxuXG4gICAgdHJ5IHtcbiAgICAgIGZyYWdtZW50LmNvbXBpbGUoY29udGV4dCwgb3B0aW9ucywgZnVuY3Rpb24gKGVyciwgcmVuZGVyZWQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGlkKVxuICAgICAgICBpZiAocmVzb2x2ZWQpIHJldHVyblxuXG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZWplY3QoZXJyKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoZnJhZ21lbnQuY3JlYXRlKHJlbmRlcmVkKSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgIHJlamVjdChlKVxuICAgIH1cbiAgfSlcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gU2VsZWN0b3JcblxuU2VsZWN0b3IuREVGQVVMVF9ORVNUX1NFUEFSQVRPUiA9IFwiOlwiXG5cbmZ1bmN0aW9uIFNlbGVjdG9yIChzZWxlY3Rvcikge1xuICBzZWxlY3RvciA9IHNlbGVjdG9yIHx8IHt9XG4gIHRoaXMuYXR0cmlidXRlID0gc2VsZWN0b3IuYXR0cmlidXRlIHx8IFwiXCJcbiAgdGhpcy52YWx1ZSA9IHNlbGVjdG9yLnZhbHVlIHx8IG51bGxcbiAgdGhpcy5vcGVyYXRvciA9IHNlbGVjdG9yLm9wZXJhdG9yIHx8IFwiPVwiXG4gIHRoaXMuZXh0cmEgPSBzZWxlY3Rvci5leHRyYSB8fCBcIlwiXG5cbiAgdGhpcy5lbGVtZW50ID0gc2VsZWN0b3IuZWxlbWVudCB8fCBudWxsXG4gIHRoaXMudW53YW50ZWRQYXJlbnRTZWxlY3RvciA9IHNlbGVjdG9yLnVud2FudGVkUGFyZW50U2VsZWN0b3IgfHwgbnVsbFxuXG4gIHRoaXMuQ29uc3RydWN0b3IgPSBzZWxlY3Rvci5Db25zdHJ1Y3RvciB8fCBudWxsXG4gIHRoaXMuaW5zdGFudGlhdGUgPSBzZWxlY3Rvci5pbnN0YW50aWF0ZSB8fCBudWxsXG4gIHRoaXMubXVsdGlwbGUgPSBzZWxlY3Rvci5tdWx0aXBsZSAhPSBudWxsID8gISFzZWxlY3Rvci5tdWx0aXBsZSA6IGZhbHNlXG5cbiAgdGhpcy5tYXRjaGVyID0gc2VsZWN0b3IubWF0Y2hlciB8fCBudWxsXG59XG5cbmZ1bmN0aW9uIHBhcmVudEZpbHRlciAodW5NYXRjaFNlbGVjdG9yLCByZWFsUGFyZW50KSB7XG4gIHJldHVybiBmdW5jdGlvbiBpc1Vud2FudGVkQ2hpbGQoZWwpIHtcbiAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50Tm9kZVxuICAgIHdoaWxlIChwYXJlbnQgJiYgcGFyZW50ICE9IHJlYWxQYXJlbnQpIHtcbiAgICAgIGlmIChwYXJlbnQubWF0Y2hlcyh1bk1hdGNoU2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGVcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0b3IodGhpcylcbn1cblxuU2VsZWN0b3IucHJvdG90eXBlLmNvbWJpbmUgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgdmFyIHMgPSB0aGlzLmNsb25lKClcbiAgcy5leHRyYSArPSBzZWxlY3Rvci50b1N0cmluZygpXG4gIHJldHVybiBzXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5lcXVhbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YXIgcyA9IHRoaXMuY2xvbmUoKVxuICBzLm9wZXJhdG9yID0gXCI9XCJcbiAgcy52YWx1ZSA9IHZhbHVlXG4gIHJldHVybiBzXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YXIgcyA9IHRoaXMuY2xvbmUoKVxuICBzLm9wZXJhdG9yID0gXCJ+PVwiXG4gIHMudmFsdWUgPSB2YWx1ZVxuICByZXR1cm4gc1xufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUucHJlZml4ID0gZnVuY3Rpb24gKHByZSwgc2VwYXJhdG9yKSB7XG4gIHZhciBzID0gdGhpcy5jbG9uZSgpXG4gIHZhciBzZXAgPSBzLnZhbHVlID8gc2VwYXJhdG9yIHx8IFNlbGVjdG9yLkRFRkFVTFRfTkVTVF9TRVBBUkFUT1IgOiBcIlwiXG4gIHMudmFsdWUgPSBwcmUgKyBzZXAgKyBzLnZhbHVlXG4gIHJldHVybiBzXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5uZXN0ID0gZnVuY3Rpb24gKHBvc3QsIHNlcGFyYXRvcikge1xuICB2YXIgcyA9IHRoaXMuY2xvbmUoKVxuICB2YXIgc2VwID0gcy52YWx1ZSA/IHNlcGFyYXRvciB8fCBTZWxlY3Rvci5ERUZBVUxUX05FU1RfU0VQQVJBVE9SIDogXCJcIlxuICBzLnZhbHVlICs9IHNlcCArIHBvc3RcbiAgcmV0dXJuIHNcbn1cblxuU2VsZWN0b3IucHJvdG90eXBlLmZyb20gPSBmdW5jdGlvbiAoZWxlbWVudCwgZXhjZXB0KSB7XG4gIHZhciBzID0gdGhpcy5jbG9uZSgpXG4gIHMuZWxlbWVudCA9IGVsZW1lbnRcbiAgaWYgKGV4Y2VwdCkge1xuICAgIHMudW53YW50ZWRQYXJlbnRTZWxlY3RvciA9IGV4Y2VwdC50b1N0cmluZygpXG4gIH1cbiAgcmV0dXJuIHNcbn1cblxuU2VsZWN0b3IucHJvdG90eXBlLnNlbGVjdCA9IGZ1bmN0aW9uIChlbGVtZW50LCB0cmFuc2Zvcm0pIHtcbiAgdmFyIHJlc3VsdCA9IGVsZW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnRvU3RyaW5nKCkpXG4gIGlmIChyZXN1bHQgJiYgdGhpcy51bndhbnRlZFBhcmVudFNlbGVjdG9yICYmIHRoaXMuZWxlbWVudCkge1xuICAgIHZhciBpc1dhbnRlZENoaWxkID0gcGFyZW50RmlsdGVyKHRoaXMudW53YW50ZWRQYXJlbnRTZWxlY3RvciwgdGhpcy5lbGVtZW50KVxuICAgIGlmICghaXNXYW50ZWRDaGlsZChyZXN1bHQpKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0XG4gICAgICA/IHRyYW5zZm9ybSA/IHRyYW5zZm9ybShyZXN1bHQpIDogcmVzdWx0XG4gICAgICA6IG51bGxcbn1cblxuU2VsZWN0b3IucHJvdG90eXBlLnNlbGVjdEFsbCA9IGZ1bmN0aW9uIChlbGVtZW50LCB0cmFuc2Zvcm0pIHtcbiAgdmFyIHJlc3VsdCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnRvU3RyaW5nKCkpXG4gIGlmICh0aGlzLnVud2FudGVkUGFyZW50U2VsZWN0b3IgJiYgdGhpcy5lbGVtZW50KSB7XG4gICAgcmVzdWx0ID0gW10uZmlsdGVyLmNhbGwocmVzdWx0LCBwYXJlbnRGaWx0ZXIodGhpcy51bndhbnRlZFBhcmVudFNlbGVjdG9yLCB0aGlzLmVsZW1lbnQpKVxuICB9XG4gIHJldHVybiB0cmFuc2Zvcm0gPyBbXS5tYXAuY2FsbChyZXN1bHQsIHRyYW5zZm9ybSkgOiBbXS5zbGljZS5jYWxsKHJlc3VsdClcbn1cblxuU2VsZWN0b3IucHJvdG90eXBlLm5vZGUgPSBmdW5jdGlvbiAodHJhbnNmb3JtKSB7XG4gIHJldHVybiB0aGlzLnNlbGVjdCh0aGlzLmVsZW1lbnQsIHRyYW5zZm9ybSlcbn1cblxuU2VsZWN0b3IucHJvdG90eXBlLm5vZGVMaXN0ID0gZnVuY3Rpb24gKHRyYW5zZm9ybSkge1xuICByZXR1cm4gdGhpcy5zZWxlY3RBbGwodGhpcy5lbGVtZW50LCB0cmFuc2Zvcm0pXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBDb25zdHJ1Y3RvciA9IHRoaXMuQ29uc3RydWN0b3JcbiAgdmFyIGluc3RhbnRpYXRlID0gdGhpcy5pbnN0YW50aWF0ZSB8fCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3IoZWxlbWVudClcbiAgfVxuICBpZiAodGhpcy5tdWx0aXBsZSkge1xuICAgIHJldHVybiB0aGlzLm5vZGVMaXN0KCkubWFwKGluc3RhbnRpYXRlKVxuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiB0aGlzLm5vZGUoaW5zdGFudGlhdGUpXG4gIH1cbn1cblxuU2VsZWN0b3IucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLkNvbnN0cnVjdG9yIHx8IHRoaXMuaW5zdGFudGlhdGUpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3QoKVxuICB9XG4gIGlmICh0aGlzLm11bHRpcGxlKSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZUxpc3QoKVxuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiB0aGlzLm5vZGUoKVxuICB9XG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHN0cmluZyA9IFwiXCJcbiAgdmFyIHZhbHVlID0gdGhpcy52YWx1ZVxuICB2YXIgYXR0cmlidXRlID0gdGhpcy5hdHRyaWJ1dGVcbiAgdmFyIGV4dHJhID0gdGhpcy5leHRyYSB8fCBcIlwiXG5cbiAgc3dpdGNoIChhdHRyaWJ1dGUpIHtcbiAgICBjYXNlIFwiaWRcIjpcbiAgICAgICAgc3RyaW5nID0gXCIjXCIgKyB2YWx1ZVxuICAgICAgYnJlYWtcbiAgICBjYXNlIFwiY2xhc3NcIjpcbiAgICAgIHN0cmluZyA9IFwiLlwiICsgdmFsdWVcbiAgICAgIGJyZWFrXG4gICAgY2FzZSBcIlwiOlxuICAgICAgc3RyaW5nID0gdmFsdWUgfHwgXCJcIlxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gXCJcIiB8fCB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gZmFsc2UgfHwgdmFsdWUgPT0gbnVsbFxuICAgICAgICA/IFwiXCJcbiAgICAgICAgOiAnXCInICsgdmFsdWUgKyAnXCInXG4gICAgICB2YXIgb3BlcmF0b3IgPSB2YWx1ZSA/IHRoaXMub3BlcmF0b3IgfHwgXCI9XCIgOiBcIlwiXG4gICAgICBzdHJpbmcgPSBcIltcIiArIGF0dHJpYnV0ZSArIG9wZXJhdG9yICsgdmFsdWUgKyBcIl1cIlxuICB9XG5cbiAgc3RyaW5nICs9IGV4dHJhXG5cbiAgcmV0dXJuIHN0cmluZ1xufVxuIiwidmFyIGluaGVyaXQgPSByZXF1aXJlKFwibWF0Y2hib3gtZmFjdG9yeS9pbmhlcml0XCIpXG52YXIgRGF0YSA9IHJlcXVpcmUoXCIuLi9EYXRhXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gQm9vbGVhbkRhdGFcblxuZnVuY3Rpb24gQm9vbGVhbkRhdGEgKG5hbWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpIHtcbiAgRGF0YS5jYWxsKHRoaXMsIG5hbWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpXG59XG5cbmluaGVyaXQoQm9vbGVhbkRhdGEsIERhdGEpXG5cbkJvb2xlYW5EYXRhLnByb3RvdHlwZS50eXBlID0gXCJCb29sZWFuXCJcblxuQm9vbGVhbkRhdGEucHJvdG90eXBlLmNoZWNrVHlwZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09IFwiYm9vbGVhblwiXG59XG5cbkJvb2xlYW5EYXRhLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IFwidHJ1ZVwiXG59XG5cbkJvb2xlYW5EYXRhLnByb3RvdHlwZS5zdHJpbmdpZnkgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID8gXCJ0cnVlXCIgOiBcImZhbHNlXCJcbn1cbiIsInZhciBpbmhlcml0ID0gcmVxdWlyZShcIm1hdGNoYm94LWZhY3RvcnkvaW5oZXJpdFwiKVxudmFyIERhdGEgPSByZXF1aXJlKFwiLi4vRGF0YVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZsb2F0RGF0YVxuXG5mdW5jdGlvbiBGbG9hdERhdGEgKG5hbWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpIHtcbiAgRGF0YS5jYWxsKHRoaXMsIG5hbWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpXG59XG5cbmluaGVyaXQoRmxvYXREYXRhLCBEYXRhKVxuXG5GbG9hdERhdGEucHJvdG90eXBlLnR5cGUgPSBcImZsb2F0XCJcblxuRmxvYXREYXRhLnByb3RvdHlwZS5jaGVja1R5cGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSBcIm51bWJlclwiXG59XG5cbkZsb2F0RGF0YS5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpXG59XG5cbkZsb2F0RGF0YS5wcm90b3R5cGUuc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiBcIlwiK3ZhbHVlXG59XG4iLCJ2YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCJtYXRjaGJveC1mYWN0b3J5L2luaGVyaXRcIilcbnZhciBEYXRhID0gcmVxdWlyZShcIi4uL0RhdGFcIilcblxubW9kdWxlLmV4cG9ydHMgPSBKU09ORGF0YVxuXG5mdW5jdGlvbiBKU09ORGF0YSAobmFtZSwgZGVmYXVsdFZhbHVlLCBvbkNoYW5nZSkge1xuICBEYXRhLmNhbGwodGhpcywgbmFtZSwgZGVmYXVsdFZhbHVlLCBvbkNoYW5nZSlcbn1cblxuaW5oZXJpdChKU09ORGF0YSwgRGF0YSlcblxuSlNPTkRhdGEucHJvdG90eXBlLnR5cGUgPSBcImpzb25cIlxuXG5KU09ORGF0YS5wcm90b3R5cGUuY2hlY2tUeXBlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsXG59XG5cbkpTT05EYXRhLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSlcbn1cblxuSlNPTkRhdGEucHJvdG90eXBlLnN0cmluZ2lmeSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpXG59XG4iLCJ2YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCJtYXRjaGJveC1mYWN0b3J5L2luaGVyaXRcIilcbnZhciBEYXRhID0gcmVxdWlyZShcIi4uL0RhdGFcIilcblxubW9kdWxlLmV4cG9ydHMgPSBOdW1iZXJEYXRhXG5cbmZ1bmN0aW9uIE51bWJlckRhdGEgKG5hbWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpIHtcbiAgRGF0YS5jYWxsKHRoaXMsIG5hbWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpXG59XG5cbmluaGVyaXQoTnVtYmVyRGF0YSwgRGF0YSlcblxuTnVtYmVyRGF0YS5wcm90b3R5cGUudHlwZSA9IFwibnVtYmVyXCJcblxuTnVtYmVyRGF0YS5wcm90b3R5cGUuY2hlY2tUeXBlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gXCJudW1iZXJcIlxufVxuXG5OdW1iZXJEYXRhLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gcGFyc2VJbnQodmFsdWUsIDEwKVxufVxuXG5OdW1iZXJEYXRhLnByb3RvdHlwZS5zdHJpbmdpZnkgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIFwiXCIrdmFsdWVcbn1cbiIsInZhciBpbmhlcml0ID0gcmVxdWlyZShcIm1hdGNoYm94LWZhY3RvcnkvaW5oZXJpdFwiKVxudmFyIERhdGEgPSByZXF1aXJlKFwiLi4vRGF0YVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0cmluZ0RhdGFcblxuZnVuY3Rpb24gU3RyaW5nRGF0YSAobmFtZSwgZGVmYXVsdFZhbHVlLCBvbkNoYW5nZSkge1xuICBEYXRhLmNhbGwodGhpcywgbmFtZSwgZGVmYXVsdFZhbHVlLCBvbkNoYW5nZSlcbn1cblxuaW5oZXJpdChTdHJpbmdEYXRhLCBEYXRhKVxuXG5TdHJpbmdEYXRhLnByb3RvdHlwZS50eXBlID0gXCJzdHJpbmdcIlxuXG5TdHJpbmdEYXRhLnByb3RvdHlwZS5jaGVja1R5cGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSBcInN0cmluZ1wiXG59XG5cblN0cmluZ0RhdGEucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA/IFwiXCIrdmFsdWUgOiBcIlwiXG59XG5cblN0cmluZ0RhdGEucHJvdG90eXBlLnN0cmluZ2lmeSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPyBcIlwiK3ZhbHVlIDogXCJcIlxufVxuIiwidmFyIGRhdGEgPSBtb2R1bGUuZXhwb3J0cyA9IHt9XG5cbmRhdGEuQm9vbGVhbiA9IHJlcXVpcmUoXCIuL0Jvb2xlYW5EYXRhXCIpXG5kYXRhLlN0cmluZyA9IHJlcXVpcmUoXCIuL1N0cmluZ0RhdGFcIilcbmRhdGEuTnVtYmVyID0gcmVxdWlyZShcIi4vTnVtYmVyRGF0YVwiKVxuZGF0YS5GbG9hdCA9IHJlcXVpcmUoXCIuL0Zsb2F0RGF0YVwiKVxuZGF0YS5KU09OID0gcmVxdWlyZShcIi4vSlNPTkRhdGFcIilcblxuZGF0YS5jcmVhdGUgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUsIG9uQ2hhbmdlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlXG5cbiAgc3dpdGNoKHR5cGUpIHtcbiAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgcmV0dXJuIG5ldyBkYXRhLkJvb2xlYW4obmFtZSwgdmFsdWUsIG9uQ2hhbmdlKVxuICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgIHJldHVybiBuZXcgZGF0YS5TdHJpbmcobmFtZSwgdmFsdWUsIG9uQ2hhbmdlKVxuICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgIC8vIG5vdGU6IGl0IGZhaWxzIGZvciAxLjBcbiAgICAgIGlmICh2YWx1ZSA9PT0gK3ZhbHVlICYmIHZhbHVlICE9PSAodmFsdWUgfCAwKSkge1xuICAgICAgICByZXR1cm4gbmV3IGRhdGEuRmxvYXQobmFtZSwgdmFsdWUsIG9uQ2hhbmdlKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBkYXRhLk51bWJlcihuYW1lLCB2YWx1ZSwgb25DaGFuZ2UpXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBuZXcgZGF0YS5KU09OKG5hbWUsIHZhbHVlLCBvbkNoYW5nZSlcbiAgfVxufVxuIiwidmFyIFNlbGVjdG9yID0gcmVxdWlyZShcIi4uL1NlbGVjdG9yXCIpXG5cbi8qKlxuICogUmVnaXN0ZXJzIGFuIGV2ZW50IGxpc3RlbmVyIG9uIGFuIGVsZW1lbnRcbiAqIGFuZCByZXR1cm5zIGEgZGVsZWdhdG9yLlxuICogQSBkZWxlZ2F0ZWQgZXZlbnQgcnVucyBtYXRjaGVzIHRvIGZpbmQgYW4gZXZlbnQgdGFyZ2V0LFxuICogdGhlbiBleGVjdXRlcyB0aGUgaGFuZGxlciBwYWlyZWQgd2l0aCB0aGUgbWF0Y2hlci5cbiAqIE1hdGNoZXJzIGNhbiBjaGVjayBpZiBhbiBldmVudCB0YXJnZXQgbWF0Y2hlcyBhIGdpdmVuIHNlbGVjdG9yLFxuICogb3Igc2VlIGlmIGFuIG9mIGl0cyBwYXJlbnRzIGRvLlxuICogKi9cbm1vZHVsZS5leHBvcnRzID0gZGVsZWdhdGVcblxuZnVuY3Rpb24gZGVsZWdhdGUoIG9wdGlvbnMgKXtcbiAgdmFyIGVsZW1lbnQgPSBvcHRpb25zLmVsZW1lbnRcbiAgICAsIGV2ZW50ID0gb3B0aW9ucy5ldmVudFxuICAgICwgY2FwdHVyZSA9ICEhb3B0aW9ucy5jYXB0dXJlIHx8IGZhbHNlXG4gICAgLCBjb250ZXh0ID0gb3B0aW9ucy5jb250ZXh0IHx8IGVsZW1lbnRcbiAgICAsIHRyYW5zZm9ybSA9IG9wdGlvbnMudHJhbnNmb3JtIHx8IG51bGxcblxuICBpZiggIWVsZW1lbnQgKXtcbiAgICBjb25zb2xlLmxvZyhcIkNhbid0IGRlbGVnYXRlIHVuZGVmaW5lZCBlbGVtZW50XCIpXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICBpZiggIWV2ZW50ICl7XG4gICAgY29uc29sZS5sb2coXCJDYW4ndCBkZWxlZ2F0ZSB1bmRlZmluZWQgZXZlbnRcIilcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgdmFyIGhhbmRsZXIgPSBjcmVhdGVIYW5kbGVyKGNvbnRleHQsIHRyYW5zZm9ybSlcbiAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLCBjYXB0dXJlKVxuXG4gIHJldHVybiBoYW5kbGVyXG59XG5cbi8qKlxuICogUmV0dXJucyBhIGRlbGVnYXRvciB0aGF0IGNhbiBiZSB1c2VkIGFzIGFuIGV2ZW50IGxpc3RlbmVyLlxuICogVGhlIGRlbGVnYXRvciBoYXMgc3RhdGljIG1ldGhvZHMgd2hpY2ggY2FuIGJlIHVzZWQgdG8gcmVnaXN0ZXIgaGFuZGxlcnMuXG4gKiAqL1xuZnVuY3Rpb24gY3JlYXRlSGFuZGxlciggY29udGV4dCwgdHJhbnNmb3JtICl7XG4gIHZhciBtYXRjaGVycyA9IFtdXG5cbiAgZnVuY3Rpb24gZGVsZWdhdGVkSGFuZGxlciggZSApe1xuICAgIHZhciBsID0gbWF0Y2hlcnMubGVuZ3RoXG4gICAgaWYoICFsICl7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIHZhciBlbCA9IHRoaXNcbiAgICAgICAgLCBpID0gLTFcbiAgICAgICAgLCBoYW5kbGVyXG4gICAgICAgICwgc2VsZWN0b3JcbiAgICAgICAgLCBkZWxlZ2F0ZUVsZW1lbnRcbiAgICAgICAgLCBzdG9wUHJvcGFnYXRpb25cbiAgICAgICAgLCBhcmdzXG5cbiAgICB3aGlsZSggKytpIDwgbCApe1xuICAgICAgYXJncyA9IG1hdGNoZXJzW2ldXG4gICAgICBoYW5kbGVyID0gYXJnc1swXVxuICAgICAgc2VsZWN0b3IgPSBhcmdzWzFdXG5cbiAgICAgIGRlbGVnYXRlRWxlbWVudCA9IG1hdGNoQ2FwdHVyZVBhdGgoc2VsZWN0b3IsIGVsLCBlLCB0cmFuc2Zvcm0sIGNvbnRleHQpXG4gICAgICBpZiggZGVsZWdhdGVFbGVtZW50ICYmIGRlbGVnYXRlRWxlbWVudC5sZW5ndGggKSB7XG4gICAgICAgIHN0b3BQcm9wYWdhdGlvbiA9IGZhbHNlID09PSBoYW5kbGVyLmFwcGx5KGNvbnRleHQsIFtlXS5jb25jYXQoZGVsZWdhdGVFbGVtZW50KSlcbiAgICAgICAgaWYoIHN0b3BQcm9wYWdhdGlvbiApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgaGFuZGxlciB3aXRoIGEgdGFyZ2V0IGZpbmRlciBsb2dpY1xuICAgKiAqL1xuICBkZWxlZ2F0ZWRIYW5kbGVyLm1hdGNoID0gZnVuY3Rpb24oIHNlbGVjdG9yLCBoYW5kbGVyICl7XG4gICAgbWF0Y2hlcnMucHVzaChbaGFuZGxlciwgc2VsZWN0b3JdKVxuICAgIHJldHVybiBkZWxlZ2F0ZWRIYW5kbGVyXG4gIH1cblxuICByZXR1cm4gZGVsZWdhdGVkSGFuZGxlclxufVxuXG5mdW5jdGlvbiBtYXRjaENhcHR1cmVQYXRoKCBzZWxlY3RvciwgZWwsIGUsIHRyYW5zZm9ybSwgY29udGV4dCApe1xuICB2YXIgZGVsZWdhdGVFbGVtZW50cyA9IFtdXG4gIHZhciBkZWxlZ2F0ZUVsZW1lbnQgPSBudWxsXG4gIGlmKCBBcnJheS5pc0FycmF5KHNlbGVjdG9yKSApe1xuICAgIHZhciBpID0gLTFcbiAgICB2YXIgbCA9IHNlbGVjdG9yLmxlbmd0aFxuICAgIHdoaWxlKCArK2kgPCBsICl7XG4gICAgICBkZWxlZ2F0ZUVsZW1lbnQgPSBmaW5kUGFyZW50KHNlbGVjdG9yW2ldLCBlbCwgZSlcbiAgICAgIGlmKCAhZGVsZWdhdGVFbGVtZW50ICkgcmV0dXJuIG51bGxcbiAgICAgIGlmICh0eXBlb2YgdHJhbnNmb3JtID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBkZWxlZ2F0ZUVsZW1lbnQgPSB0cmFuc2Zvcm0oY29udGV4dCwgc2VsZWN0b3JbaV0sIGRlbGVnYXRlRWxlbWVudClcbiAgICAgIH1cbiAgICAgIGRlbGVnYXRlRWxlbWVudHMucHVzaChkZWxlZ2F0ZUVsZW1lbnQpXG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIGRlbGVnYXRlRWxlbWVudCA9IGZpbmRQYXJlbnQoc2VsZWN0b3IsIGVsLCBlKVxuICAgIGlmKCAhZGVsZWdhdGVFbGVtZW50ICkgcmV0dXJuIG51bGxcbiAgICBpZiAodHlwZW9mIHRyYW5zZm9ybSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGRlbGVnYXRlRWxlbWVudCA9IHRyYW5zZm9ybShjb250ZXh0LCBzZWxlY3RvciwgZGVsZWdhdGVFbGVtZW50KVxuICAgIH1cbiAgICBkZWxlZ2F0ZUVsZW1lbnRzLnB1c2goZGVsZWdhdGVFbGVtZW50KVxuICB9XG4gIHJldHVybiBkZWxlZ2F0ZUVsZW1lbnRzXG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHRhcmdldCBvciBhbnkgb2YgaXRzIHBhcmVudCBtYXRjaGVzIGEgc2VsZWN0b3JcbiAqICovXG5mdW5jdGlvbiBmaW5kUGFyZW50KCBzZWxlY3RvciwgZWwsIGUgKXtcbiAgdmFyIHRhcmdldCA9IGUudGFyZ2V0XG4gIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIFNlbGVjdG9yKSB7XG4gICAgc2VsZWN0b3IgPSBzZWxlY3Rvci50b1N0cmluZygpXG4gIH1cbiAgc3dpdGNoKCB0eXBlb2Ygc2VsZWN0b3IgKXtcbiAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICB3aGlsZSggdGFyZ2V0ICYmIHRhcmdldCAhPSBlbCApe1xuICAgICAgICBpZiggdGFyZ2V0Lm1hdGNoZXMgJiYgdGFyZ2V0Lm1hdGNoZXMoc2VsZWN0b3IpICkgcmV0dXJuIHRhcmdldFxuICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlIFwiZnVuY3Rpb25cIjpcbiAgICAgIHdoaWxlKCB0YXJnZXQgJiYgdGFyZ2V0ICE9IGVsICl7XG4gICAgICAgIGlmKCBzZWxlY3Rvci5jYWxsKGVsLCB0YXJnZXQpICkgcmV0dXJuIHRhcmdldFxuICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG51bGxcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0IChDbGFzcywgQmFzZSkge1xuICBDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2UucHJvdG90eXBlKVxuICBDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDbGFzc1xuXG4gIHJldHVybiBDbGFzc1xufVxuIiwidmFyIG1lcmdlID0gcmVxdWlyZShcIm1hdGNoYm94LXV0aWwvb2JqZWN0L21lcmdlXCIpXG52YXIgZm9ySW4gPSByZXF1aXJlKFwibWF0Y2hib3gtdXRpbC9vYmplY3QvaW5cIilcbnZhciBFeHRlbnNpb24gPSByZXF1aXJlKFwiLi9FeHRlbnNpb25cIilcblxubW9kdWxlLmV4cG9ydHMgPSBCbHVlcHJpbnRcblxuZnVuY3Rpb24gQmx1ZXByaW50KCBibG9ja3MsIHBhcmVudCApe1xuICB2YXIgYmx1ZXByaW50ID0gdGhpc1xuXG4gIHRoaXMuYmxvY2tzID0gbWVyZ2UoYmxvY2tzKVxuICB0aGlzLnBhcmVudCA9IHBhcmVudFxuXG4gIHRoaXMubG9jYWxFeHRlbnNpb25zID0gdGhpcy5nZXQoXCJleHRlbnNpb25zXCIsIHt9KVxuXG4gIGZvckluKHRoaXMubG9jYWxFeHRlbnNpb25zLCBmdW5jdGlvbiggbmFtZSwgZXh0ZW5zaW9uICl7XG4gICAgLy9pZiAocGFyZW50ICYmICEhfnBhcmVudC5leHRlbnNpb25OYW1lcy5pbmRleE9mKG5hbWUpKSB7XG4gICAgLy8gIHRocm93IG5ldyBFcnJvcihcIkRlc2NyaXB0aW9uIG92ZXJyaWRlIGlzIG5vdCBzdXBwb3J0ZWRcIilcbiAgICAvL31cblxuICAgIGV4dGVuc2lvbiA9IGV4dGVuc2lvbiBpbnN0YW5jZW9mIEV4dGVuc2lvblxuICAgICAgICA/IGV4dGVuc2lvblxuICAgICAgICA6IG5ldyBFeHRlbnNpb24oZXh0ZW5zaW9uKVxuICAgIGJsdWVwcmludC5sb2NhbEV4dGVuc2lvbnNbbmFtZV0gPSBleHRlbnNpb25cbiAgICBleHRlbnNpb24ubmFtZSA9IG5hbWVcbiAgfSlcblxuICB0aGlzLmdsb2JhbEV4dGVuc2lvbnMgPSB0aGlzLmxvY2FsRXh0ZW5zaW9uc1xuXG4gIGlmIChwYXJlbnQpIHtcbiAgICB0aGlzLmdsb2JhbEV4dGVuc2lvbnMgPSBtZXJnZShwYXJlbnQuZ2xvYmFsRXh0ZW5zaW9ucywgdGhpcy5sb2NhbEV4dGVuc2lvbnMpXG4gICAgZm9ySW4odGhpcy5nbG9iYWxFeHRlbnNpb25zLCBmdW5jdGlvbiAobmFtZSwgZXh0ZW5zaW9uKSB7XG4gICAgICBpZiAoZXh0ZW5zaW9uLmluaGVyaXQpIHtcbiAgICAgICAgYmx1ZXByaW50LmJsb2Nrc1tuYW1lXSA9IG1lcmdlKHBhcmVudC5nZXQobmFtZSksIGJsdWVwcmludC5nZXQobmFtZSkpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5CbHVlcHJpbnQucHJvdG90eXBlLmJ1aWxkUHJvdG90eXBlID0gZnVuY3Rpb24oIHByb3RvdHlwZSwgdG9wICl7XG4gIHRoaXMuYnVpbGQoXCJwcm90b3R5cGVcIiwgdGhpcy5nbG9iYWxFeHRlbnNpb25zLCB0b3AsIGZ1bmN0aW9uIChuYW1lLCBleHRlbnNpb24sIGJsb2NrKSB7XG4gICAgZm9ySW4oYmxvY2ssIGZ1bmN0aW9uKCBuYW1lLCB2YWx1ZSApe1xuICAgICAgZXh0ZW5zaW9uLmluaXRpYWxpemUocHJvdG90eXBlLCBuYW1lLCB2YWx1ZSlcbiAgICB9KVxuICB9KVxufVxuXG5CbHVlcHJpbnQucHJvdG90eXBlLmJ1aWxkQ2FjaGUgPSBmdW5jdGlvbiggcHJvdG90eXBlLCB0b3AgKXtcbiAgdGhpcy5idWlsZChcImNhY2hlXCIsIHRoaXMuZ2xvYmFsRXh0ZW5zaW9ucywgdG9wLCBmdW5jdGlvbiAobmFtZSwgZXh0ZW5zaW9uLCBibG9jaykge1xuICAgIGlmICghcHJvdG90eXBlLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICBwcm90b3R5cGVbbmFtZV0gPSB7fVxuICAgIH1cblxuICAgIHZhciBjYWNoZSA9IHByb3RvdHlwZVtuYW1lXVxuICAgIHZhciBpbml0aWFsaXplID0gZXh0ZW5zaW9uLmluaXRpYWxpemVcblxuICAgIGZvckluKGJsb2NrLCBmdW5jdGlvbiggbmFtZSwgdmFsdWUgKXtcbiAgICAgIGNhY2hlW25hbWVdID0gaW5pdGlhbGl6ZVxuICAgICAgICAgID8gaW5pdGlhbGl6ZShwcm90b3R5cGUsIG5hbWUsIHZhbHVlKVxuICAgICAgICAgIDogdmFsdWVcbiAgICB9KVxuICB9KVxufVxuXG5CbHVlcHJpbnQucHJvdG90eXBlLmJ1aWxkSW5zdGFuY2UgPSBmdW5jdGlvbiggaW5zdGFuY2UsIHRvcCApe1xuICB0aGlzLmJ1aWxkKFwiaW5zdGFuY2VcIiwgdGhpcy5sb2NhbEV4dGVuc2lvbnMsIHRvcCwgZnVuY3Rpb24gKG5hbWUsIGV4dGVuc2lvbiwgYmxvY2spIHtcbiAgICBmb3JJbihibG9jaywgZnVuY3Rpb24oIG5hbWUsIHZhbHVlICl7XG4gICAgICBleHRlbnNpb24uaW5pdGlhbGl6ZShpbnN0YW5jZSwgbmFtZSwgdmFsdWUpXG4gICAgfSlcbiAgfSlcbn1cblxuQmx1ZXByaW50LnByb3RvdHlwZS5idWlsZCA9IGZ1bmN0aW9uKCB0eXBlLCBleHRlbnNpb25zLCB0b3AsIGJ1aWxkICl7XG4gIHZhciBibHVlcHJpbnQgPSB0b3AgfHwgdGhpc1xuICAvL3ZhciBiYXNlID0gdGhpc1xuICBmb3JJbihleHRlbnNpb25zLCBmdW5jdGlvbiAobmFtZSwgZXh0ZW5zaW9uKSB7XG4gICAgaWYoIGV4dGVuc2lvbi50eXBlICE9IHR5cGUgKSByZXR1cm5cbiAgICAvL3ZhciBibHVlcHJpbnQgPSBleHRlbnNpb24uaW5oZXJpdCA/IHRvcCA6IGJhc2VcbiAgICB2YXIgYmxvY2sgPSBibHVlcHJpbnQuZ2V0KG5hbWUpXG4gICAgaWYoICFibG9jayApIHJldHVyblxuXG4gICAgYnVpbGQobmFtZSwgZXh0ZW5zaW9uLCBibG9jaylcbiAgfSlcbn1cblxuQmx1ZXByaW50LnByb3RvdHlwZS5kaWdlc3QgPSBmdW5jdGlvbiggbmFtZSwgZm4sIGxvb3AgKXtcbiAgaWYgKHRoaXMuaGFzKG5hbWUpKSB7XG4gICAgdmFyIGJsb2NrID0gdGhpcy5nZXQobmFtZSlcbiAgICBpZiAobG9vcCkge1xuICAgICAgZm9ySW4oYmxvY2ssIGZuKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGZuLmNhbGwodGhpcywgYmxvY2spXG4gICAgfVxuICB9XG59XG5cbkJsdWVwcmludC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24oIG5hbWUgKXtcbiAgcmV0dXJuIHRoaXMuYmxvY2tzLmhhc093blByb3BlcnR5KG5hbWUpICYmIHRoaXMuYmxvY2tzW25hbWVdICE9IG51bGxcbn1cblxuQmx1ZXByaW50LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiggbmFtZSwgZGVmYXVsdFZhbHVlICl7XG4gIGlmKCB0aGlzLmhhcyhuYW1lKSApe1xuICAgIHJldHVybiB0aGlzLmJsb2Nrc1tuYW1lXVxuICB9XG4gIGVsc2UgcmV0dXJuIGRlZmF1bHRWYWx1ZVxufVxuIiwidmFyIGluaGVyaXQgPSByZXF1aXJlKFwiLi9pbmhlcml0XCIpXG52YXIgRXh0ZW5zaW9uID0gcmVxdWlyZShcIi4vRXh0ZW5zaW9uXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gQ2FjaGVFeHRlbnNpb25cblxuZnVuY3Rpb24gQ2FjaGVFeHRlbnNpb24gKGluaXRpYWxpemUpIHtcbiAgRXh0ZW5zaW9uLmNhbGwodGhpcywge1xuICAgIHR5cGU6IFwiY2FjaGVcIixcbiAgICBpbmhlcml0OiB0cnVlLFxuICAgIGluaXRpYWxpemU6IGluaXRpYWxpemVcbiAgfSlcbn1cblxuaW5oZXJpdChDYWNoZUV4dGVuc2lvbiwgRXh0ZW5zaW9uKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBFeHRlbnNpb25cblxuZnVuY3Rpb24gRXh0ZW5zaW9uKGV4dGVuc2lvbil7XG4gIGV4dGVuc2lvbiA9IGV4dGVuc2lvbiB8fCB7fVxuICB0aGlzLm5hbWUgPSBcIlwiXG4gIHRoaXMudHlwZSA9IGV4dGVuc2lvbi50eXBlIHx8IFwiaW5zdGFuY2VcIlxuICB0aGlzLmluaGVyaXQgPSBleHRlbnNpb24uaW5oZXJpdCB8fCBmYWxzZVxuICB0aGlzLmluaXRpYWxpemUgPSBleHRlbnNpb24uaW5pdGlhbGl6ZSB8fCBudWxsXG59XG4iLCJ2YXIgZGVmaW5lID0gcmVxdWlyZShcIm1hdGNoYm94LXV0aWwvb2JqZWN0L2RlZmluZVwiKVxudmFyIGV4dGVuZE9iamVjdCA9IHJlcXVpcmUoXCJtYXRjaGJveC11dGlsL29iamVjdC9leHRlbmRcIilcbnZhciBCbHVlcHJpbnQgPSByZXF1aXJlKFwiLi9CbHVlcHJpbnRcIilcbnZhciBleHRlbmQgPSByZXF1aXJlKFwiLi9leHRlbmRcIilcbnZhciBhdWdtZW50ID0gcmVxdWlyZShcIi4vYXVnbWVudFwiKVxudmFyIGluY2x1ZGUgPSByZXF1aXJlKFwiLi9pbmNsdWRlXCIpXG52YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCIuL2luaGVyaXRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBGYWN0b3J5XG5cbmZ1bmN0aW9uIEZhY3RvcnkoIGJsdWVwcmludCwgcGFyZW50ICl7XG4gIHZhciBmYWN0b3J5ID0gdGhpc1xuXG4gIGlmKCAhKGJsdWVwcmludCBpbnN0YW5jZW9mIEJsdWVwcmludCkgKSB7XG4gICAgYmx1ZXByaW50ID0gbmV3IEJsdWVwcmludChibHVlcHJpbnQsIHBhcmVudCA/IHBhcmVudC5ibHVlcHJpbnQgOiBudWxsKVxuICB9XG5cbiAgdGhpcy5ibHVlcHJpbnQgPSBibHVlcHJpbnRcbiAgdGhpcy5wYXJlbnQgPSBwYXJlbnQgfHwgbnVsbFxuICB0aGlzLmFuY2VzdG9ycyA9IHBhcmVudCA/IHBhcmVudC5hbmNlc3RvcnMuY29uY2F0KFtwYXJlbnRdKSA6IFtdXG4gIHRoaXMucm9vdCA9IHRoaXMuYW5jZXN0b3JzWzBdIHx8IG51bGxcbiAgdGhpcy5TdXBlciA9IGJsdWVwcmludC5nZXQoXCJpbmhlcml0XCIsIG51bGwpXG4gIHRoaXMuQ29uc3RydWN0b3IgPSBibHVlcHJpbnQuZ2V0KFwiY29uc3RydWN0b3JcIiwgZnVuY3Rpb24gKCkge1xuICAgIGlmIChmYWN0b3J5LlN1cGVyKSB7XG4gICAgICBmYWN0b3J5LlN1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICB9XG4gICAgdGhpcy5jb25zdHJ1Y3Rvci5pbml0aWFsaXplKHRoaXMpXG4gIH0pXG4gIHRoaXMuQ29uc3RydWN0b3IuZXh0ZW5kID0gZnVuY3Rpb24gKHN1cGVyQmx1ZXByaW50KSB7XG4gICAgc3VwZXJCbHVlcHJpbnQgPSBzdXBlckJsdWVwcmludCB8fCB7fVxuICAgIHN1cGVyQmx1ZXByaW50W1wiaW5oZXJpdFwiXSA9IGZhY3RvcnkuQ29uc3RydWN0b3JcbiAgICB2YXIgc3VwZXJGYWN0b3J5ID0gbmV3IEZhY3Rvcnkoc3VwZXJCbHVlcHJpbnQsIGZhY3RvcnkpXG4gICAgcmV0dXJuIHN1cGVyRmFjdG9yeS5hc3NlbWJsZSgpXG4gIH1cblxuICB0aGlzLmluZHVzdHJ5LnB1c2godGhpcylcbn1cblxuRmFjdG9yeS5wcm90b3R5cGUuYXNzZW1ibGUgPSBmdW5jdGlvbigpe1xuICB2YXIgZmFjdG9yeSA9IHRoaXNcbiAgdmFyIGJsdWVwcmludCA9IHRoaXMuYmx1ZXByaW50XG4gIHZhciBDb25zdHJ1Y3RvciA9IHRoaXMuQ29uc3RydWN0b3JcblxuICBDb25zdHJ1Y3Rvci5TdXBlciA9IHRoaXMuU3VwZXJcbiAgQ29uc3RydWN0b3IuYmx1ZXByaW50ID0gYmx1ZXByaW50XG5cbiAgdGhpcy5kaWdlc3QoKVxuXG4gIGJsdWVwcmludC5idWlsZFByb3RvdHlwZShDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIGJsdWVwcmludClcbiAgYmx1ZXByaW50LmJ1aWxkQ2FjaGUoQ29uc3RydWN0b3IucHJvdG90eXBlLCBibHVlcHJpbnQpXG5cbiAgQ29uc3RydWN0b3IuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgIC8vdmFyIHRvcCA9IGZhY3RvcnkuZmluZEZhY3RvcnkoaW5zdGFuY2UuY29uc3RydWN0b3IpLmJsdWVwcmludFxuICAgIHZhciB0b3AgPSBpbnN0YW5jZS5jb25zdHJ1Y3Rvci5ibHVlcHJpbnRcbiAgICBibHVlcHJpbnQuYnVpbGRJbnN0YW5jZShpbnN0YW5jZSwgdG9wKVxuICB9XG5cbiAgcmV0dXJuIENvbnN0cnVjdG9yXG59XG5cbkZhY3RvcnkucHJvdG90eXBlLmRpZ2VzdCA9IGZ1bmN0aW9uKCAgKXtcbiAgdmFyIGZhY3RvcnkgPSB0aGlzXG4gIHZhciBibHVlcHJpbnQgPSB0aGlzLmJsdWVwcmludFxuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzLkNvbnN0cnVjdG9yXG4gIHZhciBwcm90byA9IENvbnN0cnVjdG9yLnByb3RvdHlwZVxuXG4gIGJsdWVwcmludC5kaWdlc3QoXCJpbmhlcml0XCIsIGZ1bmN0aW9uIChTdXBlcikge1xuICAgIGluaGVyaXQoQ29uc3RydWN0b3IsIFN1cGVyKVxuICB9KVxuICBibHVlcHJpbnQuZGlnZXN0KFwiaW5jbHVkZVwiLCBmdW5jdGlvbiAoaW5jbHVkZXMpIHtcbiAgICBpbmNsdWRlKENvbnN0cnVjdG9yLCBpbmNsdWRlcylcbiAgfSlcbiAgYmx1ZXByaW50LmRpZ2VzdChcImF1Z21lbnRcIiwgZnVuY3Rpb24gKGF1Z21lbnRzKSB7XG4gICAgYXVnbWVudChDb25zdHJ1Y3RvciwgYXVnbWVudHMpXG4gIH0pXG4gIGJsdWVwcmludC5kaWdlc3QoXCJwcm90b3R5cGVcIiwgZnVuY3Rpb24gKHByb3RvKSB7XG4gICAgZXh0ZW5kKENvbnN0cnVjdG9yLCBwcm90bylcbiAgfSlcbiAgaWYgKGJsdWVwcmludC5wYXJlbnQpIHtcbiAgICBleHRlbmRPYmplY3QoQ29uc3RydWN0b3IsIGJsdWVwcmludC5wYXJlbnQuZ2V0KFwic3RhdGljXCIpKVxuICB9XG4gIGJsdWVwcmludC5kaWdlc3QoXCJzdGF0aWNcIiwgZnVuY3Rpb24gKG1ldGhvZHMpIHtcbiAgICBleHRlbmRPYmplY3QoQ29uc3RydWN0b3IsIG1ldGhvZHMpXG4gIH0pXG4gIGJsdWVwcmludC5kaWdlc3QoXCJhY2Nlc3NvclwiLCBmdW5jdGlvbiggbmFtZSwgYWNjZXNzICl7XG4gICAgaWYoICFhY2Nlc3MgKSByZXR1cm5cbiAgICBpZiggdHlwZW9mIGFjY2VzcyA9PSBcImZ1bmN0aW9uXCIgKXtcbiAgICAgIGRlZmluZS5nZXR0ZXIocHJvdG8sIG5hbWUsIGFjY2VzcylcbiAgICB9XG4gICAgZWxzZSBpZiggdHlwZW9mIGFjY2Vzc1tcImdldFwiXSA9PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIGFjY2Vzc1tcInNldFwiXSA9PSBcImZ1bmN0aW9uXCIgKXtcbiAgICAgIGRlZmluZS5hY2Nlc3Nvcihwcm90bywgbmFtZSwgYWNjZXNzW1wiZ2V0XCJdLCBhY2Nlc3NbXCJzZXRcIl0pXG4gICAgfVxuICAgIGVsc2UgaWYoIHR5cGVvZiBhY2Nlc3NbXCJnZXRcIl0gPT0gXCJmdW5jdGlvblwiICl7XG4gICAgICBkZWZpbmUuZ2V0dGVyKHByb3RvLCBuYW1lLCBhY2Nlc3NbXCJnZXRcIl0pXG4gICAgfVxuICAgIGVsc2UgaWYoIHR5cGVvZiBhY2Nlc3NbXCJzZXRcIl0gPT0gXCJmdW5jdGlvblwiICl7XG4gICAgICBkZWZpbmUuZ2V0dGVyKHByb3RvLCBuYW1lLCBhY2Nlc3NbXCJzZXRcIl0pXG4gICAgfVxuICB9LCB0cnVlKVxuICAvL2JsdWVwcmludC5kaWdlc3QoXCJpbmNsdWRlXCIsIGZ1bmN0aW9uIChpbmNsdWRlcykge1xuICAvLyAgaWYgKCFBcnJheS5pc0FycmF5KGluY2x1ZGVzKSkge1xuICAvLyAgICBpbmNsdWRlcyA9IFtpbmNsdWRlc11cbiAgLy8gIH1cbiAgLy8gIGluY2x1ZGVzLmZvckVhY2goZnVuY3Rpb24gKGluY2x1ZGUpIHtcbiAgLy8gICAgdmFyIGZvcmVpZ24gPSBmYWN0b3J5LmZpbmRGYWN0b3J5KGluY2x1ZGUpXG4gIC8vICAgIGlmIChmb3JlaWduKSB7XG4gIC8vICAgICAgZm9yZWlnbi5ibHVlcHJpbnQuYnVpbGQoXCJwcm90b3R5cGVcIiwgQ29uc3RydWN0b3IucHJvdG90eXBlLCBibHVlcHJpbnQpXG4gIC8vICAgIH1cbiAgLy8gIH0pXG4gIC8vfSlcbn1cblxuRmFjdG9yeS5wcm90b3R5cGUuaW5kdXN0cnkgPSBbXVxuXG5GYWN0b3J5LnByb3RvdHlwZS5maW5kRmFjdG9yeSA9IGZ1bmN0aW9uKCBDb25zdHJ1Y3RvciApe1xuICB2YXIgcmV0ID0gbnVsbFxuICB0aGlzLmluZHVzdHJ5LnNvbWUoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICByZXR1cm4gZmFjdG9yeS5Db25zdHJ1Y3RvciA9PT0gQ29uc3RydWN0b3IgJiYgKHJldCA9IGZhY3RvcnkpXG4gIH0pXG4gIHJldHVybiByZXRcbn1cbiIsInZhciBpbmhlcml0ID0gcmVxdWlyZShcIi4vaW5oZXJpdFwiKVxudmFyIEV4dGVuc2lvbiA9IHJlcXVpcmUoXCIuL0V4dGVuc2lvblwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEluc3RhbmNlRXh0ZW5zaW9uXG5cbmZ1bmN0aW9uIEluc3RhbmNlRXh0ZW5zaW9uIChpbml0aWFsaXplKSB7XG4gIEV4dGVuc2lvbi5jYWxsKHRoaXMsIHtcbiAgICB0eXBlOiBcImluc3RhbmNlXCIsXG4gICAgaW5oZXJpdDogdHJ1ZSxcbiAgICBpbml0aWFsaXplOiBpbml0aWFsaXplXG4gIH0pXG59XG5cbmluaGVyaXQoSW5zdGFuY2VFeHRlbnNpb24sIEV4dGVuc2lvbilcbiIsInZhciBpbmhlcml0ID0gcmVxdWlyZShcIi4vaW5oZXJpdFwiKVxudmFyIEV4dGVuc2lvbiA9IHJlcXVpcmUoXCIuL0V4dGVuc2lvblwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZUV4dGVuc2lvblxuXG5mdW5jdGlvbiBQcm90b3R5cGVFeHRlbnNpb24gKGluaXRpYWxpemUpIHtcbiAgRXh0ZW5zaW9uLmNhbGwodGhpcywge1xuICAgIHR5cGU6IFwicHJvdG90eXBlXCIsXG4gICAgaW5oZXJpdDogZmFsc2UsXG4gICAgaW5pdGlhbGl6ZTogaW5pdGlhbGl6ZVxuICB9KVxufVxuXG5pbmhlcml0KFByb3RvdHlwZUV4dGVuc2lvbiwgRXh0ZW5zaW9uKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhdWdtZW50IChDbGFzcywgbWl4aW4pIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkobWl4aW4pKSB7XG4gICAgbWl4aW4uZm9yRWFjaChmdW5jdGlvbiAobWl4aW4pIHtcbiAgICAgIGlmICh0eXBlb2YgbWl4aW4gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIG1peGluLmNhbGwoQ2xhc3MucHJvdG90eXBlKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBtaXhpbiA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIG1peGluLmNhbGwoQ2xhc3MucHJvdG90eXBlKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBDbGFzc1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQgKENsYXNzLCBwcm90b3R5cGUpIHtcbiAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocHJvdG90eXBlKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IFwiY29uc3RydWN0b3JcIiApIHtcbiAgICAgIHZhciBkZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihwcm90b3R5cGUsIG5hbWUpXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ2xhc3MucHJvdG90eXBlLCBuYW1lLCBkZXNjcmlwdG9yKVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gQ2xhc3Ncbn1cbiIsInZhciBleHRlbmQgPSByZXF1aXJlKFwiLi9leHRlbmRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmNsdWRlIChDbGFzcywgT3RoZXIpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoT3RoZXIpKSB7XG4gICAgT3RoZXIuZm9yRWFjaChmdW5jdGlvbiAoT3RoZXIpIHtcbiAgICAgIGlmICh0eXBlb2YgT3RoZXIgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGV4dGVuZChDbGFzcywgT3RoZXIucHJvdG90eXBlKVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAodHlwZW9mIE90aGVyID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgZXh0ZW5kKENsYXNzLCBPdGhlcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIGVsc2Uge1xuICAgIGlmICh0eXBlb2YgT3RoZXIgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBleHRlbmQoQ2xhc3MsIE90aGVyLnByb3RvdHlwZSlcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIE90aGVyID09IFwib2JqZWN0XCIpIHtcbiAgICAgIGV4dGVuZChDbGFzcywgT3RoZXIpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIENsYXNzXG59XG4iLCJ2YXIgRmFjdG9yeSA9IHJlcXVpcmUoXCIuL0ZhY3RvcnlcIilcblxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5XG5cbmZhY3RvcnkuQ2FjaGVFeHRlbnNpb24gPSByZXF1aXJlKFwiLi9DYWNoZUV4dGVuc2lvblwiKVxuZmFjdG9yeS5JbnN0YW5jZUV4dGVuc2lvbiA9IHJlcXVpcmUoXCIuL0luc3RhbmNlRXh0ZW5zaW9uXCIpXG5mYWN0b3J5LlByb3RvdHlwZUV4dGVuc2lvbiA9IHJlcXVpcmUoXCIuL1Byb3RvdHlwZUV4dGVuc2lvblwiKVxuXG5mdW5jdGlvbiBmYWN0b3J5KCBibHVlcHJpbnQgKXtcbiAgcmV0dXJuIG5ldyBGYWN0b3J5KGJsdWVwcmludCkuYXNzZW1ibGUoKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBDaGFubmVsXG5cbmZ1bmN0aW9uIENoYW5uZWwoIG5hbWUgKXtcbiAgdGhpcy5uYW1lID0gbmFtZSB8fCBcIlwiXG59XG5cbkNoYW5uZWwucHJvdG90eXBlID0gW11cbkNoYW5uZWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2hhbm5lbFxuXG5DaGFubmVsLnByb3RvdHlwZS5wdWJsaXNoID0gQ2hhbm5lbC5wcm90b3R5cGUuYnJvYWRjYXN0ID0gZnVuY3Rpb24oICApe1xuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5zbGljZSgpXG4gIHZhciBsID0gbGlzdGVuZXJzLmxlbmd0aFxuICBpZiggIWwgKXtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHZhciBlcnIgPSBudWxsXG4gIHZhciBpID0gLTFcbiAgdmFyIGxpc3RlbmVyXG5cbiAgd2hpbGUoICsraSA8IGwgKXtcbiAgICBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXVxuICAgIGlmKCBsaXN0ZW5lci5wcm94eSApIGxpc3RlbmVyID0gbGlzdGVuZXIucHJveHlcbiAgICBlcnIgPSBsaXN0ZW5lci5hcHBseShudWxsLCBhcmd1bWVudHMpXG4gICAgaWYoIGVyciAhPSBudWxsICkgcmV0dXJuIGVyclxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5DaGFubmVsLnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbiggbGlzdGVuZXIgKXtcbiAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPSBcImZ1bmN0aW9uXCIgKXtcbiAgICBjb25zb2xlLndhcm4oXCJMaXN0ZW5lciBpcyBub3QgYSBmdW5jdGlvblwiLCBsaXN0ZW5lcilcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgaWYoICF0aGlzLmlzU3Vic2NyaWJlZChsaXN0ZW5lcikgKSB7XG4gICAgdGhpcy5wdXNoKGxpc3RlbmVyKVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cbkNoYW5uZWwucHJvdG90eXBlLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24oIGxpc3RlbmVyICl7XG4gIHZhciBpID0gdGhpcy5pbmRleE9mKGxpc3RlbmVyKVxuICBpZiggfmkgKSB0aGlzLnNwbGljZShpLCAxKVxuICByZXR1cm4gdGhpc1xufVxuQ2hhbm5lbC5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uKCBsaXN0ZW5lciApe1xuICB2YXIgY2hhbm5lbCA9IHRoaXNcblxuICAvLyBwaWdneWJhY2sgb24gdGhlIGxpc3RlbmVyXG4gIGxpc3RlbmVyLnByb3h5ID0gZnVuY3Rpb24gcHJveHkoICApe1xuICAgIHZhciByZXQgPSBsaXN0ZW5lci5hcHBseShudWxsLCBhcmd1bWVudHMpXG4gICAgY2hhbm5lbC51bnN1YnNjcmliZShsaXN0ZW5lcilcbiAgICByZXR1cm4gcmV0XG4gIH1cbiAgdGhpcy5zdWJzY3JpYmUobGlzdGVuZXIpXG5cbiAgcmV0dXJuIHRoaXNcbn1cbkNoYW5uZWwucHJvdG90eXBlLmlzU3Vic2NyaWJlZCA9IGZ1bmN0aW9uKCBsaXN0ZW5lciApe1xuICByZXR1cm4gISEobGlzdGVuZXIgJiYgfnRoaXMuaW5kZXhPZihsaXN0ZW5lcikpXG59XG5DaGFubmVsLnByb3RvdHlwZS5oYXNTdWJzY3JpYmVycyA9IGZ1bmN0aW9uKCAgKXtcbiAgcmV0dXJuIHRoaXMubGVuZ3RoID4gMFxufVxuQ2hhbm5lbC5wcm90b3R5cGUuZW1wdHkgPSBmdW5jdGlvbigpe1xuICB0aGlzLnNwbGljZSgwKVxuICByZXR1cm4gdGhpc1xufVxuIiwidmFyIENoYW5uZWwgPSByZXF1aXJlKFwiLi9DaGFubmVsXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gUmFkaW9cblxuZnVuY3Rpb24gUmFkaW8oICApe1xuICB0aGlzLl9jaGFubmVscyA9IFtdXG59XG5cbi8qKlxuICogQ3JlYXRlIGEgY2hhbm5lbCBpZiBpdCBkb2Vzbid0IGV4aXN0IGFscmVhZHlcbiAqIGFuZCByZXR1cm4gdGhlIGNoYW5uZWwuXG4gKiAqL1xuUmFkaW8ucHJvdG90eXBlLmNoYW5uZWwgPSBmdW5jdGlvbiggY2hhbm5lbCApe1xuICByZXR1cm4gdGhpcy5fY2hhbm5lbHNbY2hhbm5lbF1cbiAgICAgIHx8ICh0aGlzLl9jaGFubmVsc1tjaGFubmVsXSA9IG5ldyBDaGFubmVsKGNoYW5uZWwpKVxufVxuLyoqXG4gKiBDaGVjayBpZiBhIGNoYW5uZWwgZXhpc3RzLlxuICogKi9cblJhZGlvLnByb3RvdHlwZS5jaGFubmVsRXhpc3RzID0gZnVuY3Rpb24oIGNoYW5uZWwgKXtcbiAgcmV0dXJuICEhY2hhbm5lbCAmJiAodHlwZW9mIGNoYW5uZWwgPT0gXCJzdHJpbmdcIlxuICAgICAgICAgID8gdGhpcy5fY2hhbm5lbHMuaGFzT3duUHJvcGVydHkoY2hhbm5lbClcbiAgICAgICAgICA6IHRoaXMuX2NoYW5uZWxzLmhhc093blByb3BlcnR5KGNoYW5uZWwubmFtZSkpXG59XG4vKipcbiAqIERlbGV0ZSBhIGNoYW5uZWwuXG4gKiAqL1xuUmFkaW8ucHJvdG90eXBlLmRlbGV0ZUNoYW5uZWwgPSBmdW5jdGlvbiggY2hhbm5lbCApe1xuICBpZiggY2hhbm5lbCBpbnN0YW5jZW9mIENoYW5uZWwgKXtcbiAgICByZXR1cm4gZGVsZXRlIHRoaXMuX2NoYW5uZWxzW2NoYW5uZWwubmFtZV1cbiAgfVxuICByZXR1cm4gZGVsZXRlIHRoaXMuX2NoYW5uZWxzW2NoYW5uZWxdXG59XG4vKipcbiAqIENoZWNrIGlmIGEgY2hhbm5lbCBoYXMgYW55IHN1YnNjcmliZXJzLlxuICogSWYgdGhlIGNoYW5uZWwgZG9lc24ndCBleGlzdHMgaXQncyBgZmFsc2VgLlxuICogKi9cblJhZGlvLnByb3RvdHlwZS5oYXNTdWJzY3JpYmVycyA9IGZ1bmN0aW9uKCBjaGFubmVsICl7XG4gIHJldHVybiB0aGlzLmNoYW5uZWxFeGlzdHMoY2hhbm5lbCkgJiYgdGhpcy5jaGFubmVsKGNoYW5uZWwpLmhhc1N1YnNjcmliZXJzKClcbn1cbi8qKlxuICogQ2hlY2sgaWYgYSBsaXN0ZW5lciBpcyBzdWJzY3JpYmVkIHRvIGEgY2hhbm5lbC5cbiAqIElmIHRoZSBjaGFubmVsIGRvZXNuJ3QgZXhpc3RzIGl0J3MgYGZhbHNlYC5cbiAqICovXG5SYWRpby5wcm90b3R5cGUuaXNTdWJzY3JpYmVkID0gZnVuY3Rpb24oIGNoYW5uZWwsIGxpc3RlbmVyICl7XG4gIHJldHVybiB0aGlzLmNoYW5uZWxFeGlzdHMoY2hhbm5lbCkgJiYgdGhpcy5jaGFubmVsKGNoYW5uZWwpLmlzU3Vic2NyaWJlZChsaXN0ZW5lcilcbn1cbi8qKlxuICogU2VuZCBhcmd1bWVudHMgb24gYSBjaGFubmVsLlxuICogSWYgdGhlIGNoYW5uZWwgZG9lc24ndCBleGlzdHMgbm90aGluZyBoYXBwZW5zLlxuICogKi9cblJhZGlvLnByb3RvdHlwZS5wdWJsaXNoID0gUmFkaW8ucHJvdG90eXBlLmJyb2FkY2FzdCA9IGZ1bmN0aW9uKCBjaGFubmVsICl7XG4gIGlmKCB0aGlzLmNoYW5uZWxFeGlzdHMoY2hhbm5lbCkgKXtcbiAgICBjaGFubmVsID0gdGhpcy5jaGFubmVsKGNoYW5uZWwpXG4gICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICByZXR1cm4gY2hhbm5lbC5icm9hZGNhc3QuYXBwbHkoY2hhbm5lbCwgYXJncylcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cbi8qKlxuICogU3Vic2NyaWJlIHRvIGEgY2hhbm5lbCB3aXRoIGEgbGlzdGVuZXIuXG4gKiBJdCBhbHNvIGNyZWF0ZXMgdGhlIGNoYW5uZWwgaWYgaXQgZG9lc24ndCBleGlzdHMgeWV0LlxuICogKi9cblJhZGlvLnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbiggY2hhbm5lbCwgbGlzdGVuZXIgKXtcbiAgdGhpcy5jaGFubmVsKGNoYW5uZWwpLnN1YnNjcmliZShsaXN0ZW5lcilcbiAgcmV0dXJuIHRoaXNcbn1cbi8qKlxuICogVW5zdWJzY3JpYmUgYSBsaXN0ZW5lciBmcm9tIGEgY2hhbm5lbC5cbiAqIElmIHRoZSBjaGFubmVsIGRvZXNuJ3QgZXhpc3RzIG5vdGhpbmcgaGFwcGVucy5cbiAqICovXG5SYWRpby5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiggY2hhbm5lbCwgbGlzdGVuZXIgKXtcbiAgaWYoIHRoaXMuY2hhbm5lbEV4aXN0cyhjaGFubmVsKSApIHtcbiAgICB0aGlzLmNoYW5uZWwoY2hhbm5lbCkudW5zdWJzY3JpYmUobGlzdGVuZXIpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cbi8qKlxuICogU3Vic2NyaWJlIGEgbGlzdGVuZXIgdG8gYSBjaGFubmVsXG4gKiB0aGF0IHVuc3Vic2NyaWJlcyBhZnRlciB0aGUgZmlyc3QgYnJvYWRjYXN0IGl0IHJlY2VpdmVzLlxuICogSXQgYWxzbyBjcmVhdGVzIHRoZSBjaGFubmVsIGlmIGl0IGRvZXNuJ3QgZXhpc3RzIHlldC5cbiAqICovXG5SYWRpby5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uKCBjaGFubmVsLCBsaXN0ZW5lciApe1xuICB0aGlzLmNoYW5uZWwoY2hhbm5lbCkucGVlayhsaXN0ZW5lcilcbiAgcmV0dXJuIHRoaXNcbn1cbi8qKlxuICogRW1wdHkgYSBjaGFubmVsIHJlbW92aW5nIGV2ZXJ5IHN1YnNjcmliZXIgaXQgaG9sZHMsXG4gKiBidXQgbm90IGRlbGV0aW5nIHRoZSBjaGFubmVsIGl0c2VsZi5cbiAqIElmIHRoZSBjaGFubmVsIGRvZXNuJ3QgZXhpc3RzIG5vdGhpbmcgaGFwcGVucy5cbiAqICovXG5SYWRpby5wcm90b3R5cGUuZW1wdHlDaGFubmVsID0gZnVuY3Rpb24oIGNoYW5uZWwgKXtcbiAgaWYoIHRoaXMuY2hhbm5lbEV4aXN0cyhjaGFubmVsKSApIHtcbiAgICB0aGlzLmNoYW5uZWwoY2hhbm5lbCkuZW1wdHkoKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG4iLCJ2YXIgUmFkaW8gPSByZXF1aXJlKFwiLi9SYWRpb1wiKVxudmFyIENoYW5uZWwgPSByZXF1aXJlKFwiLi9DaGFubmVsXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gUmFkaW9cbm1vZHVsZS5leHBvcnRzLkNoYW5uZWwgPSBDaGFubmVsXG4iLCJtb2R1bGUuZXhwb3J0cyA9IERlc2NyaXB0b3JcblxudmFyIF93cml0YWJsZSA9IFwiX3dyaXRhYmxlXCJcbnZhciBfZW51bWVyYWJsZSA9IFwiX2VudW1lcmFibGVcIlxudmFyIF9jb25maWd1cmFibGUgPSBcIl9jb25maWd1cmFibGVcIlxuXG5mdW5jdGlvbiBEZXNjcmlwdG9yKCB3cml0YWJsZSwgZW51bWVyYWJsZSwgY29uZmlndXJhYmxlICl7XG4gIHRoaXMudmFsdWUodGhpcywgX3dyaXRhYmxlLCB3cml0YWJsZSB8fCBmYWxzZSlcbiAgdGhpcy52YWx1ZSh0aGlzLCBfZW51bWVyYWJsZSwgZW51bWVyYWJsZSB8fCBmYWxzZSlcbiAgdGhpcy52YWx1ZSh0aGlzLCBfY29uZmlndXJhYmxlLCBjb25maWd1cmFibGUgfHwgZmFsc2UpXG5cbiAgdGhpcy5nZXR0ZXIodGhpcywgXCJ3XCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMud3JpdGFibGUgfSlcbiAgdGhpcy5nZXR0ZXIodGhpcywgXCJ3cml0YWJsZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIG5ldyBEZXNjcmlwdG9yKHRydWUsIGVudW1lcmFibGUsIGNvbmZpZ3VyYWJsZSlcbiAgfSlcblxuICB0aGlzLmdldHRlcih0aGlzLCBcImVcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5lbnVtZXJhYmxlIH0pXG4gIHRoaXMuZ2V0dGVyKHRoaXMsIFwiZW51bWVyYWJsZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIG5ldyBEZXNjcmlwdG9yKHdyaXRhYmxlLCB0cnVlLCBjb25maWd1cmFibGUpXG4gIH0pXG5cbiAgdGhpcy5nZXR0ZXIodGhpcywgXCJjXCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuY29uZmlndXJhYmxlIH0pXG4gIHRoaXMuZ2V0dGVyKHRoaXMsIFwiY29uZmlndXJhYmxlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IERlc2NyaXB0b3Iod3JpdGFibGUsIGVudW1lcmFibGUsIHRydWUpXG4gIH0pXG59XG5cbkRlc2NyaXB0b3IucHJvdG90eXBlID0ge1xuICBhY2Nlc3NvcjogZnVuY3Rpb24oIG9iaiwgbmFtZSwgZ2V0dGVyLCBzZXR0ZXIgKXtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICBlbnVtZXJhYmxlOiB0aGlzW19lbnVtZXJhYmxlXSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdGhpc1tfY29uZmlndXJhYmxlXSxcbiAgICAgIGdldDogZ2V0dGVyLFxuICAgICAgc2V0OiBzZXR0ZXJcbiAgICB9KVxuICAgIHJldHVybiB0aGlzXG4gIH0sXG4gIGdldHRlcjogZnVuY3Rpb24oIG9iaiwgbmFtZSwgZm4gKXtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICBlbnVtZXJhYmxlOiB0aGlzW19lbnVtZXJhYmxlXSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdGhpc1tfY29uZmlndXJhYmxlXSxcbiAgICAgIGdldDogZm5cbiAgICB9KVxuICAgIHJldHVybiB0aGlzXG4gIH0sXG4gIHNldHRlcjogZnVuY3Rpb24oIG9iaiwgbmFtZSwgZm4gKXtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICBlbnVtZXJhYmxlOiB0aGlzW19lbnVtZXJhYmxlXSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdGhpc1tfY29uZmlndXJhYmxlXSxcbiAgICAgIHNldDogZm5cbiAgICB9KVxuICAgIHJldHVybiB0aGlzXG4gIH0sXG4gIHZhbHVlOiBmdW5jdGlvbiggb2JqLCBuYW1lLCB2YWx1ZSApe1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgIHdyaXRhYmxlOiB0aGlzW193cml0YWJsZV0sXG4gICAgICBlbnVtZXJhYmxlOiB0aGlzW19lbnVtZXJhYmxlXSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdGhpc1tfY29uZmlndXJhYmxlXSxcbiAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgbWV0aG9kOiBmdW5jdGlvbiggb2JqLCBuYW1lLCBmbiApe1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgIHdyaXRhYmxlOiB0aGlzW193cml0YWJsZV0sXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdGhpc1tfY29uZmlndXJhYmxlXSxcbiAgICAgIHZhbHVlOiBmblxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgcHJvcGVydHk6IGZ1bmN0aW9uKCBvYmosIG5hbWUsIHZhbHVlICl7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgICAgd3JpdGFibGU6IHRoaXNbX3dyaXRhYmxlXSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgY29uZmlndXJhYmxlOiB0aGlzW19jb25maWd1cmFibGVdLFxuICAgICAgdmFsdWU6IHZhbHVlXG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9LFxuICBjb25zdGFudDogZnVuY3Rpb24oIG9iaiwgbmFtZSwgdmFsdWUgKXtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICB2YWx1ZTogdmFsdWVcbiAgICB9KVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cbiIsInZhciBleHRlbmQgPSByZXF1aXJlKFwiLi9leHRlbmRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBleHRlbmQoe30sIG9iailcbn1cbiIsInZhciBjb3B5ID0gcmVxdWlyZShcIi4vY29weVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmF1bHRzIChvcHRpb25zLCBkZWZhdWx0cykge1xuICBpZiAoIW9wdGlvbnMpIHtcbiAgICByZXR1cm4gY29weShkZWZhdWx0cylcbiAgfVxuXG4gIHZhciBvYmogPSBjb3B5KG9wdGlvbnMpXG5cbiAgZm9yICh2YXIgcHJvcCBpbiBkZWZhdWx0cykge1xuICAgIGlmIChkZWZhdWx0cy5oYXNPd25Qcm9wZXJ0eShwcm9wKSAmJiAhb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgb2JqW3Byb3BdID0gZGVmYXVsdHNbcHJvcF1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqXG59XG4iLCJ2YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL0Rlc2NyaXB0b3JcIilcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgRGVzY3JpcHRvcigpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZCggb2JqLCBleHRlbnNpb24gKXtcbiAgZm9yKCB2YXIgbmFtZSBpbiBleHRlbnNpb24gKXtcbiAgICBpZiggZXh0ZW5zaW9uLmhhc093blByb3BlcnR5KG5hbWUpICkgb2JqW25hbWVdID0gZXh0ZW5zaW9uW25hbWVdXG4gIH1cbiAgcmV0dXJuIG9ialxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggb2JqLCBjYWxsYmFjayApe1xuICBmb3IoIHZhciBwcm9wIGluIG9iaiApe1xuICAgIGlmKCBvYmouaGFzT3duUHJvcGVydHkocHJvcCkgKXtcbiAgICAgIGNhbGxiYWNrKHByb3AsIG9ialtwcm9wXSwgb2JqKVxuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqXG59XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZShcIi4vZXh0ZW5kXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIG9iaiwgZXh0ZW5zaW9uICl7XG4gIHJldHVybiBleHRlbmQoZXh0ZW5kKHt9LCBvYmopLCBleHRlbnNpb24pXG59XG4iLCJ2YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCJtYXRjaGJveC1mYWN0b3J5L2luaGVyaXRcIilcbnZhciBpbmNsdWRlID0gcmVxdWlyZShcIm1hdGNoYm94LWZhY3RvcnkvaW5jbHVkZVwiKVxudmFyIFNlbGVjdG9yID0gcmVxdWlyZShcIm1hdGNoYm94LWRvbS9TZWxlY3RvclwiKVxudmFyIEV2ZW50ID0gcmVxdWlyZShcIi4vRXZlbnRcIilcbnZhciBDaGlsZCA9IHJlcXVpcmUoXCIuL0NoaWxkXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aW9uXG5cbkFjdGlvbi5ERUZBVUxUX0FUVFJJQlVURSA9IFwiZGF0YS1hY3Rpb25cIlxuXG5mdW5jdGlvbiBBY3Rpb24gKGV2ZW50LCB0YXJnZXQsIGhhbmRsZXIpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEFjdGlvbikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIG5ldyBBY3Rpb24oZXZlbnQpXG4gICAgICBjYXNlIDI6XG4gICAgICAgIHJldHVybiBuZXcgQWN0aW9uKGV2ZW50LCB0YXJnZXQpXG4gICAgICBjYXNlIDM6XG4gICAgICAgIHJldHVybiBuZXcgQWN0aW9uKGV2ZW50LCB0YXJnZXQsIGhhbmRsZXIpXG4gICAgfVxuICB9XG5cbiAgdGhpcy5sb29rdXAgPSBudWxsXG5cbiAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgY2FzZSAxOlxuICAgICAgdGhpcy5ldmVudCA9IG5ldyBFdmVudChldmVudClcbiAgICAgIHRoaXMubG9va3VwID0gZXZlbnQubG9va3VwIHx8IG51bGxcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAyOlxuICAgICAgdGhpcy5ldmVudCA9IG5ldyBFdmVudChldmVudCwgdGFyZ2V0KVxuICAgICAgYnJlYWtcbiAgICBjYXNlIDM6XG4gICAgICB0aGlzLmV2ZW50ID0gbmV3IEV2ZW50KGV2ZW50LCB0YXJnZXQsIGhhbmRsZXIpXG4gICAgICBicmVha1xuICB9XG59XG5cbkFjdGlvbi5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIChhY3Rpb24sIHZpZXdOYW1lKSB7XG4gIHZhciBzZWxlY3RvciA9IG5ldyBTZWxlY3Rvcih7YXR0cmlidXRlOiBBY3Rpb24uREVGQVVMVF9BVFRSSUJVVEUsIHZhbHVlOiBhY3Rpb259KVxuXG4gIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLmV2ZW50LnRhcmdldCkpIHtcbiAgICB0aGlzLmV2ZW50LnRhcmdldCA9IFtdXG4gIH1cblxuICB0aGlzLmV2ZW50LnRhcmdldCA9IHRoaXMuZXZlbnQudGFyZ2V0Lm1hcChmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgICBpZiAoISh0eXBlb2Ygc2VsZWN0b3IgPT0gXCJzdHJpbmdcIikpIHtcbiAgICAgIHJldHVybiBzZWxlY3RvclxuICAgIH1cblxuICAgIGlmICghdmlld05hbWUgfHwgc2VsZWN0b3JbMF0gIT0gU2VsZWN0b3IuREVGQVVMVF9ORVNUX1NFUEFSQVRPUikge1xuICAgICAgcmV0dXJuIG5ldyBDaGlsZChzZWxlY3RvcilcbiAgICB9XG5cbiAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnN1YnN0cigxKVxuICAgIHJldHVybiBuZXcgQ2hpbGQoc2VsZWN0b3IpLnByZWZpeCh2aWV3TmFtZSlcbiAgfSlcblxuICBpZiAodmlld05hbWUpIHtcbiAgICB0aGlzLmV2ZW50LnRhcmdldC5wdXNoKHNlbGVjdG9yLnByZWZpeCh2aWV3TmFtZSkpXG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy5ldmVudC50YXJnZXQucHVzaChzZWxlY3RvcilcbiAgfVxuXG4gIHZhciBsb29rdXAgPSB0aGlzLmxvb2t1cFxuICB0aGlzLmV2ZW50LnRyYW5zZm9ybSA9IGZ1bmN0aW9uICh2aWV3LCBkZWxlZ2F0ZVNlbGVjdG9yLCBkZWxlZ2F0ZUVsZW1lbnQpIHtcbiAgICB2YXIgY2hpbGRcbiAgICBpZiAoZGVsZWdhdGVTZWxlY3RvciBpbnN0YW5jZW9mIENoaWxkKSB7XG4gICAgICBjaGlsZCA9IHZpZXcuZ2V0Q2hpbGRWaWV3KGRlbGVnYXRlU2VsZWN0b3IubmFtZSwgZGVsZWdhdGVFbGVtZW50KVxuICAgIH1cbiAgICBlbHNlIGlmIChkZWxlZ2F0ZVNlbGVjdG9yIGluc3RhbmNlb2YgU2VsZWN0b3IgJiYgbG9va3VwKSB7XG4gICAgICBjaGlsZCA9IHZpZXcuZ2V0Q2hpbGRWaWV3KGxvb2t1cCwgZGVsZWdhdGVFbGVtZW50KVxuICAgIH1cblxuICAgIHJldHVybiBjaGlsZCB8fCBkZWxlZ2F0ZUVsZW1lbnRcbiAgfVxufVxuXG5BY3Rpb24ucHJvdG90eXBlLnJlZ2lzdGVyRXZlbnQgPSBmdW5jdGlvbiAoZWxlbWVudCwgY29udGV4dCkge1xuICB0aGlzLmV2ZW50LnJlZ2lzdGVyKGVsZW1lbnQsIGNvbnRleHQpXG59XG5cbkFjdGlvbi5wcm90b3R5cGUudW5SZWdpc3RlckV2ZW50ID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgdGhpcy5ldmVudC51blJlZ2lzdGVyKGVsZW1lbnQpXG59XG4iLCJ2YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCJtYXRjaGJveC1mYWN0b3J5L2luaGVyaXRcIilcbnZhciBTZWxlY3RvciA9IHJlcXVpcmUoXCJtYXRjaGJveC1kb20vU2VsZWN0b3JcIilcblxubW9kdWxlLmV4cG9ydHMgPSBDaGlsZFxuXG5DaGlsZC5ERUZBVUxUX0FUVFJJQlVURSA9IFwiZGF0YS12aWV3XCJcblxuZnVuY3Rpb24gQ2hpbGQgKGNoaWxkKSB7XG4gIGNoaWxkID0gY2hpbGQgfHwge31cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIENoaWxkKSkge1xuICAgIHJldHVybiBuZXcgQ2hpbGQoY2hpbGQpXG4gIH1cblxuICBzd2l0Y2ggKHR5cGVvZiBjaGlsZCkge1xuICAgIGNhc2UgXCJmdW5jdGlvblwiOlxuICAgICAgU2VsZWN0b3IuY2FsbCh0aGlzLCB7Q29uc3RydWN0b3I6IGNoaWxkfSlcbiAgICAgIGJyZWFrXG4gICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgU2VsZWN0b3IuY2FsbCh0aGlzLCB7dmFsdWU6IGNoaWxkfSlcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIFNlbGVjdG9yLmNhbGwodGhpcywgY2hpbGQpXG4gIH1cblxuICB0aGlzLmF0dHJpYnV0ZSA9IHRoaXMuYXR0cmlidXRlIHx8IENoaWxkLkRFRkFVTFRfQVRUUklCVVRFXG4gIHRoaXMuYXV0b3NlbGVjdCA9IGNoaWxkLmF1dG9zZWxlY3QgPT0gdW5kZWZpbmVkID8gZmFsc2UgOiBjaGlsZC5hdXRvc2VsZWN0XG4gIHRoaXMucHJvcGVydHkgPSBjaGlsZC5wcm9wZXJ0eSB8fCB0aGlzLnZhbHVlXG4gIHRoaXMubG9va3VwID0gY2hpbGQubG9va3VwIHx8IG51bGxcbiAgdGhpcy5uYW1lID0gY2hpbGQubmFtZSB8fCB0aGlzLnZhbHVlXG59XG5cbmluaGVyaXQoQ2hpbGQsIFNlbGVjdG9yKVxuXG5DaGlsZC5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIChwcm9wZXJ0eSwgY2hpbGROYW1lKSB7XG4gIHRoaXMucHJvcGVydHkgPSBwcm9wZXJ0eVxuICB0aGlzLm5hbWUgPSBjaGlsZE5hbWVcbn1cblxuQ2hpbGQucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcylcbn1cbiIsInZhciBkZWxlZ2F0ZSA9IHJlcXVpcmUoXCJtYXRjaGJveC1kb20vZXZlbnQvZGVsZWdhdGVcIilcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudFxuXG5mdW5jdGlvbiBFdmVudCAoZXZlbnQsIHRhcmdldCwgY2FwdHVyZSwgb25jZSwgaGFuZGxlcikge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgRXZlbnQpKSB7XG4gICAgcmV0dXJuIG5ldyBFdmVudChldmVudCwgdGFyZ2V0LCBjYXB0dXJlLCBvbmNlLCBoYW5kbGVyKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBldmVudCA9PSBcInN0cmluZ1wiKSB7XG4gICAgdGhpcy50eXBlID0gZXZlbnRcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgdGhpcy5oYW5kbGVyID0gdGFyZ2V0XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIDM6XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0XG4gICAgICAgIHRoaXMuaGFuZGxlciA9IGNhcHR1cmVcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXRcbiAgICAgICAgdGhpcy5jYXB0dXJlID0gY2FwdHVyZVxuICAgICAgICB0aGlzLmhhbmRsZXIgPSBvbmNlXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIDU6XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0XG4gICAgICAgIHRoaXMuY2FwdHVyZSA9IGNhcHR1cmVcbiAgICAgICAgdGhpcy5vbmNlID0gb25jZVxuICAgICAgICB0aGlzLmhhbmRsZXIgPSBoYW5kbGVyXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICAgIHRoaXMudHJhbnNmb3JtID0gbnVsbFxuICB9XG4gIGVsc2Uge1xuICAgIGV2ZW50ID0gZXZlbnQgfHwge31cbiAgICB0aGlzLnR5cGUgPSBldmVudC50eXBlXG4gICAgdGhpcy50YXJnZXQgPSBldmVudC50YXJnZXRcbiAgICB0aGlzLm9uY2UgPSAhIWV2ZW50Lm9uY2VcbiAgICB0aGlzLmNhcHR1cmUgPSAhIWV2ZW50LmNhcHR1cmVcbiAgICB0aGlzLmhhbmRsZXIgPSBldmVudC5oYW5kbGVyXG4gICAgaWYgKGV2ZW50LnRyYW5zZm9ybSApIHRoaXMudHJhbnNmb3JtID0gZXZlbnQudHJhbnNmb3JtXG4gIH1cbiAgdGhpcy5wcm94eSA9IHRoaXMuaGFuZGxlclxufVxuXG5FdmVudC5wcm90b3R5cGUudHJhbnNmb3JtID0gZnVuY3Rpb24gKCkge31cblxuRXZlbnQucHJvdG90eXBlLnJlZ2lzdGVyID0gZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRleHQpIHtcbiAgaWYgKHRoaXMudGFyZ2V0KSB7XG4gICAgdGhpcy5wcm94eSA9IGRlbGVnYXRlKHtcbiAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICBldmVudDogdGhpcy50eXBlLFxuICAgICAgY29udGV4dDogY29udGV4dCxcbiAgICAgIHRyYW5zZm9ybTogdGhpcy50cmFuc2Zvcm1cbiAgICB9KVxuICAgIHRoaXMucHJveHkubWF0Y2godGhpcy50YXJnZXQsIHRoaXMuaGFuZGxlcilcbiAgfVxuICBlbHNlIHtcbiAgICBpZiAodGhpcy5vbmNlKSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodGhpcy50eXBlLCB0aGlzLmhhbmRsZXIsIHRoaXMuY2FwdHVyZSlcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodGhpcy50eXBlLCB0aGlzLmhhbmRsZXIsIHRoaXMuY2FwdHVyZSlcbiAgICB9XG4gIH1cbn1cblxuRXZlbnQucHJvdG90eXBlLnVuUmVnaXN0ZXIgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICBpZiAodGhpcy5wcm94eSkge1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLnR5cGUsIHRoaXMucHJveHksIHRoaXMuY2FwdHVyZSlcbiAgfVxuICBlbHNlIHtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy50eXBlLCB0aGlzLmhhbmRsZXIsIHRoaXMuY2FwdHVyZSlcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBNb2RpZmllclxuXG5mdW5jdGlvbiBNb2RpZmllciAobW9kaWZpZXIpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIE1vZGlmaWVyKSkge1xuICAgIHJldHVybiBuZXcgTW9kaWZpZXIobW9kaWZpZXIpXG4gIH1cblxuICB0aGlzLnR5cGUgPSBtb2RpZmllci50eXBlXG4gIHRoaXMuZGVmYXVsdCA9IG1vZGlmaWVyLmRlZmF1bHQgPT0gbnVsbCA/IG51bGwgOiBtb2RpZmllci5kZWZhdWx0XG4gIHRoaXMudmFsdWVzID0gW11cbiAgdGhpcy52YWx1ZSA9IG51bGxcbiAgdGhpcy5vbmNoYW5nZSA9IG51bGxcbiAgdGhpcy5hbmltYXRpb25EdXJhdGlvbiA9IG1vZGlmaWVyLmFuaW1hdGlvbkR1cmF0aW9uIHx8IDBcbiAgdGhpcy50aW1lcklkID0gbnVsbFxuICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgIGNhc2UgXCJzd2l0Y2hcIjpcbiAgICAgIHRoaXMudmFsdWVzLnB1c2gobW9kaWZpZXIub24gJiYgdHlwZW9mIG1vZGlmaWVyLm9uID09IFwic3RyaW5nXCIgPyBtb2RpZmllci5vbiA6IG51bGwpXG4gICAgICB0aGlzLnZhbHVlcy5wdXNoKG1vZGlmaWVyLm9mZiAmJiB0eXBlb2YgbW9kaWZpZXIub2ZmID09IFwic3RyaW5nXCIgPyBtb2RpZmllci5vZmYgOiBudWxsKVxuICAgICAgYnJlYWtcbiAgICBjYXNlIFwiZW51bVwiOlxuICAgICAgdGhpcy52YWx1ZXMgPSBtb2RpZmllci52YWx1ZXMgfHwgW11cbiAgICAgIGJyZWFrXG4gIH1cbn1cblxuTW9kaWZpZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRleHQpIHtcbiAgaWYgKHRoaXMuZGVmYXVsdCAhPSBudWxsKSB7XG4gICAgdGhpcy5zZXQodGhpcy5kZWZhdWx0LCBlbGVtZW50LCBjb250ZXh0KVxuICB9XG59XG5cbk1vZGlmaWVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnZhbHVlXG59XG5cbk1vZGlmaWVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodmFsdWUsIGVsZW1lbnQsIGNvbnRleHQpIHtcbiAgY29udGV4dCA9IGNvbnRleHQgfHwgZWxlbWVudFxuXG4gIHZhciBwcmV2aW91c1ZhbHVlID0gdGhpcy52YWx1ZVxuICB2YXIgcHJldmlvdXNDbGFzc05hbWUgPSBwcmV2aW91c1ZhbHVlXG4gIHZhciBuZXdWYWx1ZSA9IHZhbHVlXG4gIHZhciBuZXdDbGFzc05hbWUgPSB2YWx1ZVxuXG4gIGlmICh0aGlzLnR5cGUgPT0gXCJzd2l0Y2hcIikge1xuICAgIG5ld1ZhbHVlID0gISF2YWx1ZVxuXG4gICAgdmFyIG9uID0gdGhpcy52YWx1ZXNbMF1cbiAgICB2YXIgb2ZmID0gdGhpcy52YWx1ZXNbMV1cblxuICAgIHByZXZpb3VzQ2xhc3NOYW1lID0gcHJldmlvdXNWYWx1ZSA9PSBudWxsXG4gICAgICAgID8gbnVsbFxuICAgICAgICA6IHByZXZpb3VzVmFsdWUgPyBvbiA6IG9mZlxuICAgIG5ld0NsYXNzTmFtZSA9IG5ld1ZhbHVlID8gb24gOiBvZmZcbiAgfVxuXG4gIGlmIChwcmV2aW91c1ZhbHVlID09PSBuZXdWYWx1ZSB8fCAhfnRoaXMudmFsdWVzLmluZGV4T2YobmV3Q2xhc3NOYW1lKSkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICB9XG4gIGlmIChwcmV2aW91c0NsYXNzTmFtZSAmJiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhwcmV2aW91c0NsYXNzTmFtZSkpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUocHJldmlvdXNDbGFzc05hbWUpXG4gIH1cbiAgdGhpcy52YWx1ZSA9IG5ld1ZhbHVlXG4gIGlmIChuZXdDbGFzc05hbWUpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQobmV3Q2xhc3NOYW1lKVxuICB9XG5cbiAgcmV0dXJuIGNhbGxPbkNoYW5nZSh0aGlzLCBjb250ZXh0LCBwcmV2aW91c1ZhbHVlLCBuZXdWYWx1ZSlcbn1cblxuTW9kaWZpZXIucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBjb250ZXh0KSB7XG4gIGNvbnRleHQgPSBjb250ZXh0IHx8IGVsZW1lbnRcbiAgaWYgKHRoaXMudmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICB9XG4gIGlmICh0aGlzLnRpbWVySWQpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lcklkKVxuICAgIHRoaXMudGltZXJJZCA9IG51bGxcbiAgfVxuXG4gIHZhciBwcmV2aW91c1ZhbHVlID0gdGhpcy52YWx1ZVxuICB2YXIgcHJldmlvdXNDbGFzc05hbWUgPSBwcmV2aW91c1ZhbHVlXG5cbiAgaWYgKHRoaXMudHlwZSA9PSBcInN3aXRjaFwiKSB7XG4gICAgdmFyIG9uID0gdGhpcy52YWx1ZXNbMF1cbiAgICB2YXIgb2ZmID0gdGhpcy52YWx1ZXNbMV1cblxuICAgIHByZXZpb3VzQ2xhc3NOYW1lID0gcHJldmlvdXNWYWx1ZSA9PSBudWxsXG4gICAgICAgID8gbnVsbFxuICAgICAgICA6IHByZXZpb3VzVmFsdWUgPyBvbiA6IG9mZlxuICB9XG5cbiAgaWYgKHByZXZpb3VzQ2xhc3NOYW1lICYmIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKHByZXZpb3VzQ2xhc3NOYW1lKSkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShwcmV2aW91c0NsYXNzTmFtZSlcbiAgfVxuICB0aGlzLnZhbHVlID0gbnVsbFxuXG4gIHJldHVybiBjYWxsT25DaGFuZ2UodGhpcywgY29udGV4dCwgcHJldmlvdXNWYWx1ZSwgbnVsbClcbn1cblxuZnVuY3Rpb24gY2FsbE9uQ2hhbmdlIChtb2RpZmllciwgY29udGV4dCwgcHJldmlvdXNWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgaWYgKG1vZGlmaWVyLmFuaW1hdGlvbkR1cmF0aW9uKSB7XG4gICAgICBpZiAobW9kaWZpZXIudGltZXJJZCkge1xuICAgICAgICBjbGVhclRpbWVvdXQobW9kaWZpZXIudGltZXJJZClcbiAgICAgICAgbW9kaWZpZXIudGltZXJJZCA9IG51bGxcbiAgICAgIH1cbiAgICAgIG1vZGlmaWVyLnRpbWVySWQgPSBzZXRUaW1lb3V0KHJlc29sdmUsIG1vZGlmaWVyLmFuaW1hdGlvbkR1cmF0aW9uKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJlc29sdmUoKVxuICAgIH1cbiAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHR5cGVvZiBtb2RpZmllci5vbmNoYW5nZSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJldHVybiBtb2RpZmllci5vbmNoYW5nZS5jYWxsKGNvbnRleHQsIHByZXZpb3VzVmFsdWUsIG5ld1ZhbHVlKVxuICAgIH1cbiAgfSlcbn1cbiIsInZhciBkZWZpbmUgPSByZXF1aXJlKFwibWF0Y2hib3gtdXRpbC9vYmplY3QvZGVmaW5lXCIpXG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKFwibWF0Y2hib3gtdXRpbC9vYmplY3QvZGVmYXVsdHNcIilcbnZhciBmb3JJbiA9IHJlcXVpcmUoXCJtYXRjaGJveC11dGlsL29iamVjdC9pblwiKVxudmFyIGZhY3RvcnkgPSByZXF1aXJlKFwibWF0Y2hib3gtZmFjdG9yeVwiKVxudmFyIEluc3RhbmNlRXh0ZW5zaW9uID0gcmVxdWlyZShcIm1hdGNoYm94LWZhY3RvcnkvSW5zdGFuY2VFeHRlbnNpb25cIilcbnZhciBDYWNoZUV4dGVuc2lvbiA9IHJlcXVpcmUoXCJtYXRjaGJveC1mYWN0b3J5L0NhY2hlRXh0ZW5zaW9uXCIpXG52YXIgRG9tRGF0YSA9IHJlcXVpcmUoXCJtYXRjaGJveC1kb20vRGF0YVwiKVxudmFyIGRvbURhdGEgPSByZXF1aXJlKFwibWF0Y2hib3gtZG9tL2RhdGFcIilcbnZhciBTZWxlY3RvciA9IHJlcXVpcmUoXCJtYXRjaGJveC1kb20vU2VsZWN0b3JcIilcbnZhciBSYWRpbyA9IHJlcXVpcmUoXCJtYXRjaGJveC1yYWRpb1wiKVxudmFyIEZyYWdtZW50ID0gcmVxdWlyZShcIm1hdGNoYm94LWRvbS9GcmFnbWVudFwiKVxudmFyIEV2ZW50ID0gcmVxdWlyZShcIi4vRXZlbnRcIilcbnZhciBNb2RpZmllciA9IHJlcXVpcmUoXCIuL01vZGlmaWVyXCIpXG52YXIgQ2hpbGQgPSByZXF1aXJlKFwiLi9DaGlsZFwiKVxudmFyIEFjdGlvbiA9IHJlcXVpcmUoXCIuL0FjdGlvblwiKVxuXG52YXIgVmlldyA9IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSh7XG4gIGluY2x1ZGU6IFtSYWRpb10sXG5cbiAgZXh0ZW5zaW9uczoge1xuICAgIGxheW91dHM6IG5ldyBDYWNoZUV4dGVuc2lvbigpLFxuICAgIG1vZGVsczogbmV3IENhY2hlRXh0ZW5zaW9uKCksXG4gICAgZXZlbnRzOiBuZXcgSW5zdGFuY2VFeHRlbnNpb24oZnVuY3Rpb24gKHZpZXcsIG5hbWUsIGV2ZW50KSB7XG4gICAgICBpZiAoIShldmVudCBpbnN0YW5jZW9mIEV2ZW50KSkge1xuICAgICAgICBldmVudCA9IG5ldyBFdmVudChldmVudClcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgZXZlbnQuaGFuZGxlciA9PSBcInN0cmluZ1wiICYmIHR5cGVvZiB2aWV3W2V2ZW50LmhhbmRsZXJdID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBldmVudC5oYW5kbGVyID0gdmlld1tldmVudC5oYW5kbGVyXS5iaW5kKHZpZXcpXG4gICAgICB9XG4gICAgICB2aWV3Ll9ldmVudHNbbmFtZV0gPSBldmVudFxuICAgIH0pLFxuICAgIGFjdGlvbnM6IG5ldyBJbnN0YW5jZUV4dGVuc2lvbihmdW5jdGlvbiAodmlldywgbmFtZSwgYWN0aW9uKSB7XG4gICAgICBpZiAoIShhY3Rpb24gaW5zdGFuY2VvZiBBY3Rpb24pKSB7XG4gICAgICAgIGFjdGlvbiA9IG5ldyBBY3Rpb24oYWN0aW9uKVxuICAgICAgfVxuICAgICAgYWN0aW9uLmluaXRpYWxpemUobmFtZSwgdmlldy52aWV3TmFtZSlcbiAgICAgIGlmICh0eXBlb2YgYWN0aW9uLmhhbmRsZXIgPT0gXCJzdHJpbmdcIiAmJiB0eXBlb2Ygdmlld1thY3Rpb24uaGFuZGxlcl0gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGFjdGlvbi5oYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiB2aWV3W2FjdGlvbi5oYW5kbGVyXS5hcHBseSh2aWV3LCBhcmd1bWVudHMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZpZXcuX2FjdGlvbnNbbmFtZV0gPSBhY3Rpb25cbiAgICB9KSxcbiAgICBkYXRhc2V0OiBuZXcgQ2FjaGVFeHRlbnNpb24oZnVuY3Rpb24gKHByb3RvdHlwZSwgbmFtZSwgZGF0YSkge1xuICAgICAgaWYgKCEoZGF0YSBpbnN0YW5jZW9mIERvbURhdGEpKSB7XG4gICAgICAgIGRhdGEgPSBkb21EYXRhLmNyZWF0ZShuYW1lLCBkYXRhKVxuICAgICAgfVxuICAgICAgZGF0YS5uYW1lID0gZGF0YS5uYW1lIHx8IG5hbWVcblxuICAgICAgcmV0dXJuIGRhdGFcbiAgICB9KSxcbiAgICBtb2RpZmllcnM6IG5ldyBJbnN0YW5jZUV4dGVuc2lvbihmdW5jdGlvbiAodmlldywgbmFtZSwgbW9kaWZpZXIpIHtcbiAgICAgIGlmICghKG1vZGlmaWVyIGluc3RhbmNlb2YgTW9kaWZpZXIpKSB7XG4gICAgICAgIG1vZGlmaWVyID0gbmV3IE1vZGlmaWVyKG1vZGlmaWVyKVxuICAgICAgfVxuICAgICAgdmlldy5fbW9kaWZpZXJzW25hbWVdID0gbW9kaWZpZXJcbiAgICB9KSxcbiAgICBjaGlsZHJlbjogbmV3IENhY2hlRXh0ZW5zaW9uKGZ1bmN0aW9uKHByb3RvdHlwZSwgbmFtZSwgY2hpbGQpe1xuICAgICAgaWYgKCEoY2hpbGQgaW5zdGFuY2VvZiBTZWxlY3RvcikpIHtcbiAgICAgICAgY2hpbGQgPSBuZXcgQ2hpbGQoY2hpbGQpXG4gICAgICB9XG5cbiAgICAgIGNoaWxkLmluaXRpYWxpemUobmFtZSwgY2hpbGQudmFsdWUgfHwgbmFtZSlcblxuICAgICAgaWYgKHByb3RvdHlwZS52aWV3TmFtZSkge1xuICAgICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBDaGlsZCkge1xuICAgICAgICAgIHJldHVybiBjaGlsZC5jb250YWlucyhjaGlsZC5uYW1lKS5wcmVmaXgocHJvdG90eXBlLnZpZXdOYW1lKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY2hpbGQuY29udGFpbnMoY2hpbGQubmFtZSlcbiAgICB9KSxcbiAgICBmcmFnbWVudHM6IG5ldyBDYWNoZUV4dGVuc2lvbihmdW5jdGlvbiAocHJvdG90eXBlLCBuYW1lLCBmcmFnbWVudCkge1xuICAgICAgaWYgKCEoZnJhZ21lbnQgaW5zdGFuY2VvZiBGcmFnbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGcmFnbWVudChmcmFnbWVudClcbiAgICAgIH1cbiAgICAgIHJldHVybiBmcmFnbWVudFxuICAgIH0pXG4gIH0sXG5cbiAgbGF5b3V0czoge30sXG4gIG1vZGVsczoge30sXG4gIGV2ZW50czoge30sXG4gIGRhdGFzZXQ6IHt9LFxuICBtb2RpZmllcnM6IHt9LFxuICBmcmFnbWVudHM6IHt9LFxuICBjaGlsZHJlbjoge30sXG5cbiAgY29uc3RydWN0b3I6IGZ1bmN0aW9uIFZpZXcoIGVsZW1lbnQgKXtcbiAgICBSYWRpby5jYWxsKHRoaXMpXG4gICAgZGVmaW5lLnZhbHVlKHRoaXMsIFwiX2V2ZW50c1wiLCB7fSlcbiAgICBkZWZpbmUudmFsdWUodGhpcywgXCJfbW9kZWxzXCIsIHt9KVxuICAgIGRlZmluZS52YWx1ZSh0aGlzLCBcIl9hY3Rpb25zXCIsIHt9KVxuICAgIGRlZmluZS52YWx1ZSh0aGlzLCBcIl9tb2RpZmllcnNcIiwge30pXG4gICAgZGVmaW5lLndyaXRhYmxlLnZhbHVlKHRoaXMsIFwiX2VsZW1lbnRcIiwgbnVsbClcbiAgICBkZWZpbmUud3JpdGFibGUudmFsdWUodGhpcywgXCJjdXJyZW50TGF5b3V0XCIsIFwiXCIpXG4gICAgVmlldy5pbml0aWFsaXplKHRoaXMpXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFxuICB9LFxuXG4gIGFjY2Vzc29yOiB7XG4gICAgZWxlbWVudDoge1xuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICB2YXIgcHJldmlvdXMgPSB0aGlzLl9lbGVtZW50XG4gICAgICAgIGlmIChwcmV2aW91cyA9PSBlbGVtZW50KSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnRcbiAgICAgICAgdGhpcy5vbkVsZW1lbnRDaGFuZ2UoZWxlbWVudCwgcHJldmlvdXMpXG4gICAgICB9XG4gICAgfSxcbiAgICBlbGVtZW50U2VsZWN0b3I6IHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy52aWV3TmFtZSkge1xuICAgICAgICAgIHJldHVybiBuZXcgQ2hpbGQodGhpcy52aWV3TmFtZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBwcm90b3R5cGU6IHtcbiAgICB2aWV3TmFtZTogXCJcIixcbiAgICBvbkVsZW1lbnRDaGFuZ2U6IGZ1bmN0aW9uIChlbGVtZW50LCBwcmV2aW91cykge1xuICAgICAgdmFyIHZpZXcgPSB0aGlzXG4gICAgICBmb3JJbih0aGlzLl9ldmVudHMsIGZ1bmN0aW9uIChuYW1lLCBldmVudCkge1xuICAgICAgICBpZiAocHJldmlvdXMpIGV2ZW50LnVuUmVnaXN0ZXIocHJldmlvdXMpXG4gICAgICAgIGlmIChlbGVtZW50KSBldmVudC5yZWdpc3RlcihlbGVtZW50LCB2aWV3KVxuICAgICAgfSlcbiAgICAgIGZvckluKHRoaXMuX2FjdGlvbnMsIGZ1bmN0aW9uIChuYW1lLCBhY3Rpb24pIHtcbiAgICAgICAgaWYgKHByZXZpb3VzKSBhY3Rpb24udW5SZWdpc3RlckV2ZW50KHByZXZpb3VzKVxuICAgICAgICBpZiAoZWxlbWVudCkgYWN0aW9uLnJlZ2lzdGVyRXZlbnQoZWxlbWVudCwgdmlldylcbiAgICAgIH0pXG4gICAgICBmb3JJbih0aGlzLl9tb2RpZmllcnMsIGZ1bmN0aW9uIChuYW1lLCBtb2RpZmllcikge1xuICAgICAgICBtb2RpZmllci5yZXNldChlbGVtZW50LCB2aWV3KVxuICAgICAgfSlcbiAgICAgIGZvckluKHRoaXMuZGF0YXNldCwgZnVuY3Rpb24gKG5hbWUsIGRhdGEpIHtcbiAgICAgICAgaWYgKCFkYXRhLmhhcyhlbGVtZW50KSAmJiBkYXRhLmRlZmF1bHQgIT0gbnVsbCkge1xuICAgICAgICAgIGRhdGEuc2V0KGVsZW1lbnQsIGRhdGEuZGVmYXVsdClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGZvckluKHRoaXMuY2hpbGRyZW4sIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IHZpZXcuY2hpbGRyZW5bbmFtZV1cbiAgICAgICAgaWYgKGNoaWxkICYmIGNoaWxkLmF1dG9zZWxlY3QpIHtcbiAgICAgICAgICB2aWV3W25hbWVdID0gdmlldy5maW5kQ2hpbGQobmFtZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGZvckluKHRoaXMubW9kZWxzLCBmdW5jdGlvbiAobmFtZSwgQ29uc3RydWN0b3IpIHtcbiAgICAgICAgdmlldy5fbW9kZWxzW25hbWVdID0gbmV3IENvbnN0cnVjdG9yKClcbiAgICAgIH0pXG4gICAgfSxcbiAgICBvbkxheW91dENoYW5nZTogZnVuY3Rpb24gKGxheW91dCwgcHJldmlvdXMpIHt9LFxuICAgIGNoYW5nZUxheW91dDogZnVuY3Rpb24oIGxheW91dCApe1xuICAgICAgaWYgKHRoaXMuY3VycmVudExheW91dCA9PSBsYXlvdXQpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICB9XG5cbiAgICAgIHZhciBsYXlvdXRIYW5kbGVyID0gdGhpcy5sYXlvdXRzW2xheW91dF1cbiAgICAgIGlmICh0eXBlb2YgbGF5b3V0SGFuZGxlciAhPSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIkludmFsaWQgbGF5b3V0IGhhbmRsZXI6IFwiICsgbGF5b3V0KSlcbiAgICAgIH1cblxuICAgICAgdmFyIHZpZXcgPSB0aGlzXG4gICAgICB2YXIgcHJldmlvdXMgPSB2aWV3LmN1cnJlbnRMYXlvdXRcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocHJldmlvdXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbGF5b3V0SGFuZGxlci5jYWxsKHZpZXcsIHByZXZpb3VzKVxuICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZpZXcuY3VycmVudExheW91dCA9IGxheW91dFxuICAgICAgICB2aWV3Lm9uTGF5b3V0Q2hhbmdlKHByZXZpb3VzLCBsYXlvdXQpXG4gICAgICB9KVxuICAgIH0sXG4gICAgZGlzcGF0Y2g6IGZ1bmN0aW9uICh0eXBlLCBkZXRhaWwsIGRlZikge1xuICAgICAgdmFyIGRlZmluaXRpb24gPSBkZWZhdWx0cyhkZWYsIHtcbiAgICAgICAgZGV0YWlsOiBkZXRhaWwgfHwgbnVsbCxcbiAgICAgICAgdmlldzogd2luZG93LFxuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBjYW5jZWxhYmxlOiB0cnVlXG4gICAgICB9KVxuICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyB3aW5kb3cuQ3VzdG9tRXZlbnQodHlwZSwgZGVmaW5pdGlvbikpXG4gICAgfSxcbiAgICBnZXREYXRhOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGFzZXRbbmFtZV1cbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhLmdldCh0aGlzLmVsZW1lbnQpXG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH0sXG4gICAgc2V0RGF0YTogZnVuY3Rpb24gKG5hbWUsIHZhbHVlLCBzaWxlbnQpIHtcbiAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhc2V0W25hbWVdXG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gZGF0YS5zZXQodGhpcy5lbGVtZW50LCB2YWx1ZSwgc2lsZW50KVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVtb3ZlRGF0YTogZnVuY3Rpb24gKG5hbWUsIHNpbGVudCkge1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGFzZXRbbmFtZV1cbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIGRhdGEucmVtb3ZlKHRoaXMuZWxlbWVudCwgc2lsZW50KVxuICAgICAgfVxuICAgIH0sXG4gICAgaGFzRGF0YTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhc2V0W25hbWVdXG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gZGF0YS5oYXModGhpcy5lbGVtZW50KVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSxcbiAgICBzZXRNb2RpZmllcjogZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICBpZiAodGhpcy5fbW9kaWZpZXJzW25hbWVdICYmIHRoaXMuZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kaWZpZXJzW25hbWVdLnNldCh2YWx1ZSwgdGhpcy5lbGVtZW50LCB0aGlzKVxuICAgICAgfVxuICAgIH0sXG4gICAgZ2V0TW9kaWZpZXI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICBpZiAodGhpcy5fbW9kaWZpZXJzW25hbWVdKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2RpZmllcnNbbmFtZV0uZ2V0KClcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlbW92ZU1vZGlmaWVyOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgaWYgKHRoaXMuX21vZGlmaWVyc1tuYW1lXSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kaWZpZXJzW25hbWVdLnJlbW92ZSh0aGlzLmVsZW1lbnQsIHRoaXMpXG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRNb2RlbDogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIG5hbWUgPSBuYW1lIHx8IFwiZGVmYXVsdFwiXG4gICAgICB2YXIgbW9kZWwgPSB0aGlzLl9tb2RlbHNbbmFtZV1cbiAgICAgIGlmIChtb2RlbCA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBhY2Nlc3MgdW5rbm93biBtb2RlbFwiKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbW9kZWxcbiAgICB9LFxuICAgIHNldE1vZGVsOiBmdW5jdGlvbiAobmFtZSwgbW9kZWwpIHtcbiAgICAgIGlmICghbW9kZWwpIHtcbiAgICAgICAgbW9kZWwgPSBuYW1lXG4gICAgICAgIG5hbWUgPSBcImRlZmF1bHRcIlxuICAgICAgfVxuICAgICAgdGhpcy5fbW9kZWxzW25hbWVdID0gbW9kZWxcbiAgICB9LFxuICAgIHNldHVwRWxlbWVudDogZnVuY3Rpb24gKHJvb3QpIHtcbiAgICAgIHJvb3QgPSByb290IHx8IGRvY3VtZW50LmJvZHlcbiAgICAgIGlmIChyb290ICYmIHRoaXMuZWxlbWVudFNlbGVjdG9yKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuZWxlbWVudFNlbGVjdG9yLmZyb20ocm9vdCkuZmluZCgpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcbiAgICBnZXRDaGlsZFZpZXc6IGZ1bmN0aW9uIChjaGlsZFByb3BlcnR5LCBlbGVtZW50KSB7XG4gICAgICB2YXIgY2hpbGQgPSB0aGlzLmNoaWxkcmVuW2NoaWxkUHJvcGVydHldXG4gICAgICB2YXIgbWVtYmVyID0gdGhpc1tjaGlsZFByb3BlcnR5XVxuXG4gICAgICBpZiAoY2hpbGQgJiYgY2hpbGQubXVsdGlwbGUgfHwgQXJyYXkuaXNBcnJheShtZW1iZXIpKSB7XG4gICAgICAgIHZhciBsID0gbWVtYmVyLmxlbmd0aFxuICAgICAgICB3aGlsZSAobC0tKSB7XG4gICAgICAgICAgaWYgKG1lbWJlcltsXS5lbGVtZW50ID09IGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBtZW1iZXJbbF1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbWVtYmVyXG4gICAgfSxcbiAgICBmaW5kQ2hpbGQ6IGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICAgICAgdmFyIGNoaWxkID0gdGhpcy5jaGlsZHJlbltwcm9wZXJ0eV1cbiAgICAgIGlmIChjaGlsZCkge1xuICAgICAgICB2YXIgZWxlbWVudCA9IGNoaWxkLmZyb20odGhpcy5lbGVtZW50LCB0aGlzLmVsZW1lbnRTZWxlY3RvcikuZmluZCgpXG4gICAgICAgIGlmIChlbGVtZW50ICYmIGNoaWxkLmxvb2t1cCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldENoaWxkVmlldyhjaGlsZC5sb29rdXAsIGVsZW1lbnQpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsZW1lbnRcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG59KVxuIl19
