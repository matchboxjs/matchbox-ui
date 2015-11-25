(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.matchboxUi = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ui = module.exports = {}

ui.data = require("matchbox-dom/data")
ui.View = require("./view/View")
ui.Child = require("./view/Child")
ui.Event = require("./view/Event")
ui.Modifier = require("./view/Modifier")
ui.SwitchModifier = require("./modifier/SwitchModifier")
ui.EnumModifier = require("./modifier/EnumModifier")

},{"./modifier/EnumModifier":2,"./modifier/SwitchModifier":3,"./view/Child":35,"./view/Event":36,"./view/Modifier":37,"./view/View":38,"matchbox-dom/data":12}],2:[function(require,module,exports){
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

},{"../view/Modifier":37,"matchbox-factory/inherit":24}],3:[function(require,module,exports){
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

},{"../view/Modifier":37,"matchbox-factory/inherit":24}],4:[function(require,module,exports){
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

},{"../Data":4,"matchbox-factory/inherit":24}],8:[function(require,module,exports){
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

},{"../Data":4,"matchbox-factory/inherit":24}],9:[function(require,module,exports){
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

},{"../Data":4,"matchbox-factory/inherit":24}],10:[function(require,module,exports){
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

},{"../Data":4,"matchbox-factory/inherit":24}],11:[function(require,module,exports){
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

},{"../Data":4,"matchbox-factory/inherit":24}],12:[function(require,module,exports){
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
        delegateElement = transform(context, selector, delegateElement)
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

},{"./Extension":16,"matchbox-util/object/in":33,"matchbox-util/object/merge":34}],15:[function(require,module,exports){
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

},{"./Extension":16,"./inherit":24}],16:[function(require,module,exports){
module.exports = Extension

function Extension(extension){
  extension = extension || {}
  this.name = ""
  this.type = extension.type || "instance"
  this.inherit = extension.inherit || false
  this.initialize = extension.initialize || null
}

},{}],17:[function(require,module,exports){
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

},{"./Blueprint":14,"./augment":20,"./extend":21,"./include":22,"./inherit":24,"matchbox-util/object/define":31,"matchbox-util/object/extend":32}],18:[function(require,module,exports){
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

},{"./Extension":16,"./inherit":24}],19:[function(require,module,exports){
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

},{"./Extension":16,"./inherit":24}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
module.exports = function extend (Class, prototype) {
  Object.getOwnPropertyNames(prototype).forEach(function (name) {
    if (name !== "constructor" ) {
      var descriptor = Object.getOwnPropertyDescriptor(prototype, name)
      Object.defineProperty(Class.prototype, name, descriptor)
    }
  })

  return Class
}

},{}],22:[function(require,module,exports){
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

},{"./extend":21}],23:[function(require,module,exports){
var Factory = require("./Factory")

module.exports = factory

factory.CacheExtension = require("./CacheExtension")
factory.InstanceExtension = require("./InstanceExtension")
factory.PrototypeExtension = require("./PrototypeExtension")

function factory( blueprint ){
  return new Factory(blueprint).assemble()
}

},{"./CacheExtension":15,"./Factory":17,"./InstanceExtension":18,"./PrototypeExtension":19}],24:[function(require,module,exports){
module.exports = function inherit (Class, Base) {
  Class.prototype = Object.create(Base.prototype)
  Class.prototype.constructor = Class

  return Class
}

},{}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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

},{"./Channel":25}],27:[function(require,module,exports){
var Radio = require("./Radio")
var Channel = require("./Channel")

module.exports = Radio
module.exports.Channel = Channel

},{"./Channel":25,"./Radio":26}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
var extend = require("./extend")

module.exports = function (obj) {
  return extend({}, obj)
}

},{"./extend":32}],30:[function(require,module,exports){
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

},{"./copy":29}],31:[function(require,module,exports){
var Descriptor = require("./Descriptor")

module.exports = new Descriptor()

},{"./Descriptor":28}],32:[function(require,module,exports){
module.exports = function extend( obj, extension ){
  for( var name in extension ){
    if( extension.hasOwnProperty(name) ) obj[name] = extension[name]
  }
  return obj
}

},{}],33:[function(require,module,exports){
module.exports = function( obj, callback ){
  for( var prop in obj ){
    if( obj.hasOwnProperty(prop) ){
      callback(prop, obj[prop], obj)
    }
  }
  return obj
}

},{}],34:[function(require,module,exports){
var extend = require("./extend")

module.exports = function( obj, extension ){
  return extend(extend({}, obj), extension)
}

},{"./extend":32}],35:[function(require,module,exports){
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
}

inherit(Child, Selector)

Child.prototype.clone = function () {
  return new this.constructor(this)
}

},{"matchbox-dom/Selector":6,"matchbox-factory/inherit":24}],36:[function(require,module,exports){
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

},{"matchbox-dom/event/delegate":13}],37:[function(require,module,exports){
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
  element.classList.add(newClassName)

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

},{}],38:[function(require,module,exports){
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

var View = module.exports = factory({
  include: [Radio],

  extensions: {
    layouts: new CacheExtension(),
    events: new InstanceExtension(function (view, name, event) {
      if (!(event instanceof Event)) {
        event = new Event(event)
      }
      if (typeof event.handler == "string" && typeof view[event.handler] == "function") {
        event.handler = view[event.handler].bind(view)
      }
      view._events[name] = event
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

      if (prototype.viewName) {
        if (child instanceof Child) {
          return child.contains(child.value || name).prefix(prototype.viewName)
        }
      }
      return child.contains(child.value || name)
    }),
    fragments: new CacheExtension(function (prototype, name, fragment) {
      if (!(fragment instanceof Fragment)) {
        return new Fragment(fragment)
      }
      return fragment
    })
  },

  layouts: {},
  events: {},
  dataset: {},
  modifiers: {},
  fragments: {},
  children: {},

  constructor: function View( element ){
    Radio.call(this)
    define.value(this, "_events", {})
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
      if (this._modifiers[name]) {
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
    setupElement: function (root) {
      root = root || document.body
      if (root && this.elementSelector) {
        this.element = this.elementSelector.from(root).find()
      }

      return this
    },
    findChild: function (name) {
      var child = this.children[name]
      if (child) {
        return child.from(this.element, this.elementSelector).find()
      }
      return null
    }
  }
})

},{"./Child":35,"./Event":36,"./Modifier":37,"matchbox-dom/Data":4,"matchbox-dom/Fragment":5,"matchbox-dom/Selector":6,"matchbox-dom/data":12,"matchbox-factory":23,"matchbox-factory/CacheExtension":15,"matchbox-factory/InstanceExtension":18,"matchbox-radio":27,"matchbox-util/object/defaults":30,"matchbox-util/object/define":31,"matchbox-util/object/in":33}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm1vZGlmaWVyL0VudW1Nb2RpZmllci5qcyIsIm1vZGlmaWVyL1N3aXRjaE1vZGlmaWVyLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWRvbS9EYXRhLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWRvbS9GcmFnbWVudC5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1kb20vU2VsZWN0b3IuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZG9tL2RhdGEvQm9vbGVhbkRhdGEuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZG9tL2RhdGEvRmxvYXREYXRhLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWRvbS9kYXRhL0pTT05EYXRhLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWRvbS9kYXRhL051bWJlckRhdGEuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZG9tL2RhdGEvU3RyaW5nRGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1kb20vZGF0YS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1kb20vZXZlbnQvZGVsZWdhdGUuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZmFjdG9yeS9CbHVlcHJpbnQuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZmFjdG9yeS9DYWNoZUV4dGVuc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1mYWN0b3J5L0V4dGVuc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1mYWN0b3J5L0ZhY3RvcnkuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZmFjdG9yeS9JbnN0YW5jZUV4dGVuc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1mYWN0b3J5L1Byb3RvdHlwZUV4dGVuc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1mYWN0b3J5L2F1Z21lbnQuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZmFjdG9yeS9leHRlbmQuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZmFjdG9yeS9pbmNsdWRlLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWZhY3RvcnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZmFjdG9yeS9pbmhlcml0LmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LXJhZGlvL0NoYW5uZWwuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtcmFkaW8vUmFkaW8uanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtcmFkaW8vaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtdXRpbC9vYmplY3QvRGVzY3JpcHRvci5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC11dGlsL29iamVjdC9jb3B5LmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LXV0aWwvb2JqZWN0L2RlZmF1bHRzLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LXV0aWwvb2JqZWN0L2RlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC11dGlsL29iamVjdC9leHRlbmQuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtdXRpbC9vYmplY3QvaW4uanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtdXRpbC9vYmplY3QvbWVyZ2UuanMiLCJ2aWV3L0NoaWxkLmpzIiwidmlldy9FdmVudC5qcyIsInZpZXcvTW9kaWZpZXIuanMiLCJ2aWV3L1ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHVpID0gbW9kdWxlLmV4cG9ydHMgPSB7fVxuXG51aS5kYXRhID0gcmVxdWlyZShcIm1hdGNoYm94LWRvbS9kYXRhXCIpXG51aS5WaWV3ID0gcmVxdWlyZShcIi4vdmlldy9WaWV3XCIpXG51aS5DaGlsZCA9IHJlcXVpcmUoXCIuL3ZpZXcvQ2hpbGRcIilcbnVpLkV2ZW50ID0gcmVxdWlyZShcIi4vdmlldy9FdmVudFwiKVxudWkuTW9kaWZpZXIgPSByZXF1aXJlKFwiLi92aWV3L01vZGlmaWVyXCIpXG51aS5Td2l0Y2hNb2RpZmllciA9IHJlcXVpcmUoXCIuL21vZGlmaWVyL1N3aXRjaE1vZGlmaWVyXCIpXG51aS5FbnVtTW9kaWZpZXIgPSByZXF1aXJlKFwiLi9tb2RpZmllci9FbnVtTW9kaWZpZXJcIilcbiIsInZhciBpbmhlcml0ID0gcmVxdWlyZShcIm1hdGNoYm94LWZhY3RvcnkvaW5oZXJpdFwiKVxudmFyIE1vZGlmaWVyID0gcmVxdWlyZShcIi4uL3ZpZXcvTW9kaWZpZXJcIilcblxubW9kdWxlLmV4cG9ydHMgPSBFbnVtTW9kaWZpZXJcblxuZnVuY3Rpb24gRW51bU1vZGlmaWVyIChkZWZhdWx0VmFsdWUsIHZhbHVlcywgYW5pbWF0aW9uRHVyYXRpb24pIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEVudW1Nb2RpZmllcikpIHtcbiAgICByZXR1cm4gbmV3IEVudW1Nb2RpZmllcihkZWZhdWx0VmFsdWUsIHZhbHVlcywgYW5pbWF0aW9uRHVyYXRpb24pXG4gIH1cblxuICBNb2RpZmllci5jYWxsKHRoaXMsIHtcbiAgICB0eXBlOiBcImVudW1cIixcbiAgICBkZWZhdWx0OiBkZWZhdWx0VmFsdWUsXG4gICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgYW5pbWF0aW9uRHVyYXRpb246IGFuaW1hdGlvbkR1cmF0aW9uXG4gIH0pXG59XG5cbmluaGVyaXQoRW51bU1vZGlmaWVyLCBNb2RpZmllcilcbiIsInZhciBpbmhlcml0ID0gcmVxdWlyZShcIm1hdGNoYm94LWZhY3RvcnkvaW5oZXJpdFwiKVxudmFyIE1vZGlmaWVyID0gcmVxdWlyZShcIi4uL3ZpZXcvTW9kaWZpZXJcIilcblxubW9kdWxlLmV4cG9ydHMgPSBTd2l0Y2hNb2RpZmllclxuXG5mdW5jdGlvbiBTd2l0Y2hNb2RpZmllciAoZGVmYXVsdFZhbHVlLCBvbiwgb2ZmLCBhbmltYXRpb25EdXJhdGlvbikge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU3dpdGNoTW9kaWZpZXIpKSB7XG4gICAgcmV0dXJuIG5ldyBTd2l0Y2hNb2RpZmllcihkZWZhdWx0VmFsdWUsIG9uLCBvZmYsIGFuaW1hdGlvbkR1cmF0aW9uKVxuICB9XG5cbiAgTW9kaWZpZXIuY2FsbCh0aGlzLCB7XG4gICAgdHlwZTogXCJzd2l0Y2hcIixcbiAgICBkZWZhdWx0OiBkZWZhdWx0VmFsdWUsXG4gICAgb246IG9uLFxuICAgIG9mZjogb2ZmLFxuICAgIGFuaW1hdGlvbkR1cmF0aW9uOiBhbmltYXRpb25EdXJhdGlvblxuICB9KVxufVxuXG5pbmhlcml0KFN3aXRjaE1vZGlmaWVyLCBNb2RpZmllcilcbiIsIm1vZHVsZS5leHBvcnRzID0gRG9tRGF0YVxuXG5mdW5jdGlvbiBEb21EYXRhIChuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKSB7XG4gIHRoaXMubmFtZSA9IG5hbWVcbiAgdGhpcy5vbkNoYW5nZSA9IG9uQ2hhbmdlIHx8IG51bGxcbiAgdGhpcy5kZWZhdWx0ID0gZGVmYXVsdFZhbHVlID09IG51bGwgPyBudWxsIDogZGVmYXVsdFZhbHVlXG59XG5cbkRvbURhdGEucHJvdG90eXBlLnR5cGUgPSBcIlwiXG5cbkRvbURhdGEucHJvdG90eXBlLmF0dHJpYnV0ZU5hbWUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBcImRhdGEtXCIrdGhpcy5uYW1lXG59XG5Eb21EYXRhLnByb3RvdHlwZS5jaGVja1R5cGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGxcbn1cblxuRG9tRGF0YS5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlXG59XG5cbkRvbURhdGEucHJvdG90eXBlLnN0cmluZ2lmeSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gXCJcIit2YWx1ZVxufVxuXG5Eb21EYXRhLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICB2YXIgYXR0cmlidXRlTmFtZSA9IHRoaXMuYXR0cmlidXRlTmFtZSgpXG4gIGlmIChlbGVtZW50Lmhhc0F0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKSkge1xuICAgIHJldHVybiB0aGlzLnBhcnNlKGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpKVxuICB9XG5cbiAgcmV0dXJuIHRoaXMuZGVmYXVsdFxufVxuXG5Eb21EYXRhLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWUsIGNvbnRleHQsIHNpbGVudCkge1xuICBpZiAoIXRoaXMuY2hlY2tUeXBlKHZhbHVlKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW4ndCBzZXQgRG9tRGF0YSBcIit0aGlzLnR5cGUrXCIgdG8gJ1wiK3ZhbHVlK1wiJ1wiKVxuICB9XG5cbiAgdmFyIGF0dHJpYnV0ZU5hbWUgPSB0aGlzLmF0dHJpYnV0ZU5hbWUoKVxuXG4gIHZhciBoYXNWYWx1ZSA9IGVsZW1lbnQuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpXG4gIHZhciBuZXdTdHJpbmdWYWx1ZSA9IHRoaXMuc3RyaW5naWZ5KHZhbHVlKVxuICB2YXIgcHJldlN0cmluZ1ZhbHVlID0gaGFzVmFsdWUgPyBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKSA6IG51bGxcblxuICBpZiAobmV3U3RyaW5nVmFsdWUgPT09IHByZXZTdHJpbmdWYWx1ZSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSwgbmV3U3RyaW5nVmFsdWUpXG5cbiAgaWYgKCFzaWxlbnQpIHtcbiAgICB2YXIgb25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlXG4gICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICB2YXIgcHJldmlvdXNWYWx1ZSA9IGhhc1ZhbHVlID8gdGhpcy5wYXJzZShwcmV2U3RyaW5nVmFsdWUpIDogbnVsbFxuICAgICAgb25DaGFuZ2UuY2FsbChjb250ZXh0LCBwcmV2aW91c1ZhbHVlLCB2YWx1ZSlcbiAgICB9XG4gIH1cbn1cblxuRG9tRGF0YS5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgcmV0dXJuIGVsZW1lbnQuaGFzQXR0cmlidXRlKHRoaXMuYXR0cmlidXRlTmFtZSgpKVxufVxuXG5Eb21EYXRhLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoZWxlbWVudCwgY29udGV4dCwgc2lsZW50KSB7XG4gIHZhciBhdHRyaWJ1dGVOYW1lID0gdGhpcy5hdHRyaWJ1dGVOYW1lKClcbiAgaWYgKCFlbGVtZW50Lmhhc0F0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgdmFyIHByZXZpb3VzVmFsdWUgPSBlbGVtZW50Lmhhc0F0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKVxuICAgICAgPyB0aGlzLnBhcnNlKGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpKVxuICAgICAgOiBudWxsXG5cbiAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSlcblxuICBpZiAoIXNpbGVudCkge1xuICAgIHZhciBvbkNoYW5nZSA9IHRoaXMub25DaGFuZ2VcbiAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgIG9uQ2hhbmdlLmNhbGwoY29udGV4dCwgcHJldmlvdXNWYWx1ZSwgbnVsbClcbiAgICB9XG4gIH1cbn1cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBGcmFnbWVudFxuXG5mdW5jdGlvbiBGcmFnbWVudCAoZnJhZ21lbnQpIHtcbiAgZnJhZ21lbnQgPSBmcmFnbWVudCB8fCB7fVxuICB0aGlzLmh0bWwgPSBmcmFnbWVudC5odG1sIHx8IFwiXCJcbiAgdGhpcy5maXJzdCA9IGZyYWdtZW50LmZpcnN0ID09IHVuZGVmaW5lZCB8fCAhIWZyYWdtZW50LmZpcnN0XG4gIHRoaXMudGltZW91dCA9IGZyYWdtZW50LnRpbWVvdXQgfHwgMjAwMFxufVxuXG5GcmFnbWVudC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKGh0bWwpIHtcbiAgdmFyIHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gIHRlbXAuaW5uZXJIVE1MID0gaHRtbCB8fCB0aGlzLmh0bWxcblxuICBpZiAodGhpcy5maXJzdCA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuZmlyc3QpIHtcbiAgICByZXR1cm4gdGVtcC5jaGlsZHJlblswXVxuICB9XG5cbiAgdmFyIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG4gIHdoaWxlICh0ZW1wLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQodGVtcC5maXJzdENoaWxkKVxuICB9XG5cbiAgcmV0dXJuIGZyYWdtZW50O1xufVxuXG5GcmFnbWVudC5wcm90b3R5cGUuY29tcGlsZSA9IGZ1bmN0aW9uIChodG1sLCBvcHRpb25zLCBjYikge1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBjYihudWxsLCBodG1sKVxuICB9LCA0KVxufVxuXG5GcmFnbWVudC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGZyYWdtZW50ID0gdGhpc1xuICBjb250ZXh0ID0gY29udGV4dCB8fCB7fVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlc29sdmVkID0gZmFsc2VcbiAgICB2YXIgaWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJSZW5kZXIgdGltZWQgb3V0XCIpKVxuICAgIH0sIGZyYWdtZW50LnRpbWVvdXQpXG5cbiAgICB0cnkge1xuICAgICAgZnJhZ21lbnQuY29tcGlsZShjb250ZXh0LCBvcHRpb25zLCBmdW5jdGlvbiAoZXJyLCByZW5kZXJlZCkge1xuICAgICAgICBjbGVhclRpbWVvdXQoaWQpXG4gICAgICAgIGlmIChyZXNvbHZlZCkgcmV0dXJuXG5cbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShmcmFnbWVudC5jcmVhdGUocmVuZGVyZWQpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgcmVqZWN0KGUpXG4gICAgfVxuICB9KVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBTZWxlY3RvclxuXG5TZWxlY3Rvci5ERUZBVUxUX05FU1RfU0VQQVJBVE9SID0gXCI6XCJcblxuZnVuY3Rpb24gU2VsZWN0b3IgKHNlbGVjdG9yKSB7XG4gIHNlbGVjdG9yID0gc2VsZWN0b3IgfHwge31cbiAgdGhpcy5hdHRyaWJ1dGUgPSBzZWxlY3Rvci5hdHRyaWJ1dGUgfHwgXCJcIlxuICB0aGlzLnZhbHVlID0gc2VsZWN0b3IudmFsdWUgfHwgbnVsbFxuICB0aGlzLm9wZXJhdG9yID0gc2VsZWN0b3Iub3BlcmF0b3IgfHwgXCI9XCJcbiAgdGhpcy5leHRyYSA9IHNlbGVjdG9yLmV4dHJhIHx8IFwiXCJcblxuICB0aGlzLmVsZW1lbnQgPSBzZWxlY3Rvci5lbGVtZW50IHx8IG51bGxcbiAgdGhpcy51bndhbnRlZFBhcmVudFNlbGVjdG9yID0gc2VsZWN0b3IudW53YW50ZWRQYXJlbnRTZWxlY3RvciB8fCBudWxsXG5cbiAgdGhpcy5Db25zdHJ1Y3RvciA9IHNlbGVjdG9yLkNvbnN0cnVjdG9yIHx8IG51bGxcbiAgdGhpcy5pbnN0YW50aWF0ZSA9IHNlbGVjdG9yLmluc3RhbnRpYXRlIHx8IG51bGxcbiAgdGhpcy5tdWx0aXBsZSA9IHNlbGVjdG9yLm11bHRpcGxlICE9IG51bGwgPyAhIXNlbGVjdG9yLm11bHRpcGxlIDogZmFsc2VcblxuICB0aGlzLm1hdGNoZXIgPSBzZWxlY3Rvci5tYXRjaGVyIHx8IG51bGxcbn1cblxuZnVuY3Rpb24gcGFyZW50RmlsdGVyICh1bk1hdGNoU2VsZWN0b3IsIHJlYWxQYXJlbnQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGlzVW53YW50ZWRDaGlsZChlbCkge1xuICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnROb2RlXG4gICAgd2hpbGUgKHBhcmVudCAmJiBwYXJlbnQgIT0gcmVhbFBhcmVudCkge1xuICAgICAgaWYgKHBhcmVudC5tYXRjaGVzKHVuTWF0Y2hTZWxlY3RvcikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rvcih0aGlzKVxufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUuY29tYmluZSA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICB2YXIgcyA9IHRoaXMuY2xvbmUoKVxuICBzLmV4dHJhICs9IHNlbGVjdG9yLnRvU3RyaW5nKClcbiAgcmV0dXJuIHNcbn1cblxuU2VsZWN0b3IucHJvdG90eXBlLmVxdWFsID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHZhciBzID0gdGhpcy5jbG9uZSgpXG4gIHMub3BlcmF0b3IgPSBcIj1cIlxuICBzLnZhbHVlID0gdmFsdWVcbiAgcmV0dXJuIHNcbn1cblxuU2VsZWN0b3IucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHZhciBzID0gdGhpcy5jbG9uZSgpXG4gIHMub3BlcmF0b3IgPSBcIn49XCJcbiAgcy52YWx1ZSA9IHZhbHVlXG4gIHJldHVybiBzXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5wcmVmaXggPSBmdW5jdGlvbiAocHJlLCBzZXBhcmF0b3IpIHtcbiAgdmFyIHMgPSB0aGlzLmNsb25lKClcbiAgdmFyIHNlcCA9IHMudmFsdWUgPyBzZXBhcmF0b3IgfHwgU2VsZWN0b3IuREVGQVVMVF9ORVNUX1NFUEFSQVRPUiA6IFwiXCJcbiAgcy52YWx1ZSA9IHByZSArIHNlcCArIHMudmFsdWVcbiAgcmV0dXJuIHNcbn1cblxuU2VsZWN0b3IucHJvdG90eXBlLm5lc3QgPSBmdW5jdGlvbiAocG9zdCwgc2VwYXJhdG9yKSB7XG4gIHZhciBzID0gdGhpcy5jbG9uZSgpXG4gIHZhciBzZXAgPSBzLnZhbHVlID8gc2VwYXJhdG9yIHx8IFNlbGVjdG9yLkRFRkFVTFRfTkVTVF9TRVBBUkFUT1IgOiBcIlwiXG4gIHMudmFsdWUgKz0gc2VwICsgcG9zdFxuICByZXR1cm4gc1xufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUuZnJvbSA9IGZ1bmN0aW9uIChlbGVtZW50LCBleGNlcHQpIHtcbiAgdmFyIHMgPSB0aGlzLmNsb25lKClcbiAgcy5lbGVtZW50ID0gZWxlbWVudFxuICBpZiAoZXhjZXB0KSB7XG4gICAgcy51bndhbnRlZFBhcmVudFNlbGVjdG9yID0gZXhjZXB0LnRvU3RyaW5nKClcbiAgfVxuICByZXR1cm4gc1xufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUuc2VsZWN0ID0gZnVuY3Rpb24gKGVsZW1lbnQsIHRyYW5zZm9ybSkge1xuICB2YXIgcmVzdWx0ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKHRoaXMudG9TdHJpbmcoKSlcbiAgaWYgKHJlc3VsdCAmJiB0aGlzLnVud2FudGVkUGFyZW50U2VsZWN0b3IgJiYgdGhpcy5lbGVtZW50KSB7XG4gICAgdmFyIGlzV2FudGVkQ2hpbGQgPSBwYXJlbnRGaWx0ZXIodGhpcy51bndhbnRlZFBhcmVudFNlbGVjdG9yLCB0aGlzLmVsZW1lbnQpXG4gICAgaWYgKCFpc1dhbnRlZENoaWxkKHJlc3VsdCkpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHRcbiAgICAgID8gdHJhbnNmb3JtID8gdHJhbnNmb3JtKHJlc3VsdCkgOiByZXN1bHRcbiAgICAgIDogbnVsbFxufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUuc2VsZWN0QWxsID0gZnVuY3Rpb24gKGVsZW1lbnQsIHRyYW5zZm9ybSkge1xuICB2YXIgcmVzdWx0ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMudG9TdHJpbmcoKSlcbiAgaWYgKHRoaXMudW53YW50ZWRQYXJlbnRTZWxlY3RvciAmJiB0aGlzLmVsZW1lbnQpIHtcbiAgICByZXN1bHQgPSBbXS5maWx0ZXIuY2FsbChyZXN1bHQsIHBhcmVudEZpbHRlcih0aGlzLnVud2FudGVkUGFyZW50U2VsZWN0b3IsIHRoaXMuZWxlbWVudCkpXG4gIH1cbiAgcmV0dXJuIHRyYW5zZm9ybSA/IFtdLm1hcC5jYWxsKHJlc3VsdCwgdHJhbnNmb3JtKSA6IFtdLnNsaWNlLmNhbGwocmVzdWx0KVxufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUubm9kZSA9IGZ1bmN0aW9uICh0cmFuc2Zvcm0pIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KHRoaXMuZWxlbWVudCwgdHJhbnNmb3JtKVxufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUubm9kZUxpc3QgPSBmdW5jdGlvbiAodHJhbnNmb3JtKSB7XG4gIHJldHVybiB0aGlzLnNlbGVjdEFsbCh0aGlzLmVsZW1lbnQsIHRyYW5zZm9ybSlcbn1cblxuU2VsZWN0b3IucHJvdG90eXBlLmNvbnN0cnVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIENvbnN0cnVjdG9yID0gdGhpcy5Db25zdHJ1Y3RvclxuICB2YXIgaW5zdGFudGlhdGUgPSB0aGlzLmluc3RhbnRpYXRlIHx8IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuIG5ldyBDb25zdHJ1Y3RvcihlbGVtZW50KVxuICB9XG4gIGlmICh0aGlzLm11bHRpcGxlKSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZUxpc3QoKS5tYXAoaW5zdGFudGlhdGUpXG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZShpbnN0YW50aWF0ZSlcbiAgfVxufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUuZmluZCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuQ29uc3RydWN0b3IgfHwgdGhpcy5pbnN0YW50aWF0ZSkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdCgpXG4gIH1cbiAgaWYgKHRoaXMubXVsdGlwbGUpIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlTGlzdCgpXG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZSgpXG4gIH1cbn1cblxuU2VsZWN0b3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3RyaW5nID0gXCJcIlxuICB2YXIgdmFsdWUgPSB0aGlzLnZhbHVlXG4gIHZhciBhdHRyaWJ1dGUgPSB0aGlzLmF0dHJpYnV0ZVxuICB2YXIgZXh0cmEgPSB0aGlzLmV4dHJhIHx8IFwiXCJcblxuICBzd2l0Y2ggKGF0dHJpYnV0ZSkge1xuICAgIGNhc2UgXCJpZFwiOlxuICAgICAgICBzdHJpbmcgPSBcIiNcIiArIHZhbHVlXG4gICAgICBicmVha1xuICAgIGNhc2UgXCJjbGFzc1wiOlxuICAgICAgc3RyaW5nID0gXCIuXCIgKyB2YWx1ZVxuICAgICAgYnJlYWtcbiAgICBjYXNlIFwiXCI6XG4gICAgICBzdHJpbmcgPSB2YWx1ZSB8fCBcIlwiXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB2YWx1ZSA9IHZhbHVlID09PSBcIlwiIHx8IHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSBmYWxzZSB8fCB2YWx1ZSA9PSBudWxsXG4gICAgICAgID8gXCJcIlxuICAgICAgICA6ICdcIicgKyB2YWx1ZSArICdcIidcbiAgICAgIHZhciBvcGVyYXRvciA9IHZhbHVlID8gdGhpcy5vcGVyYXRvciB8fCBcIj1cIiA6IFwiXCJcbiAgICAgIHN0cmluZyA9IFwiW1wiICsgYXR0cmlidXRlICsgb3BlcmF0b3IgKyB2YWx1ZSArIFwiXVwiXG4gIH1cblxuICBzdHJpbmcgKz0gZXh0cmFcblxuICByZXR1cm4gc3RyaW5nXG59XG4iLCJ2YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCJtYXRjaGJveC1mYWN0b3J5L2luaGVyaXRcIilcbnZhciBEYXRhID0gcmVxdWlyZShcIi4uL0RhdGFcIilcblxubW9kdWxlLmV4cG9ydHMgPSBCb29sZWFuRGF0YVxuXG5mdW5jdGlvbiBCb29sZWFuRGF0YSAobmFtZSwgZGVmYXVsdFZhbHVlLCBvbkNoYW5nZSkge1xuICBEYXRhLmNhbGwodGhpcywgbmFtZSwgZGVmYXVsdFZhbHVlLCBvbkNoYW5nZSlcbn1cblxuaW5oZXJpdChCb29sZWFuRGF0YSwgRGF0YSlcblxuQm9vbGVhbkRhdGEucHJvdG90eXBlLnR5cGUgPSBcIkJvb2xlYW5cIlxuXG5Cb29sZWFuRGF0YS5wcm90b3R5cGUuY2hlY2tUeXBlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gXCJib29sZWFuXCJcbn1cblxuQm9vbGVhbkRhdGEucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gXCJ0cnVlXCJcbn1cblxuQm9vbGVhbkRhdGEucHJvdG90eXBlLnN0cmluZ2lmeSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPyBcInRydWVcIiA6IFwiZmFsc2VcIlxufVxuIiwidmFyIGluaGVyaXQgPSByZXF1aXJlKFwibWF0Y2hib3gtZmFjdG9yeS9pbmhlcml0XCIpXG52YXIgRGF0YSA9IHJlcXVpcmUoXCIuLi9EYXRhXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gRmxvYXREYXRhXG5cbmZ1bmN0aW9uIEZsb2F0RGF0YSAobmFtZSwgZGVmYXVsdFZhbHVlLCBvbkNoYW5nZSkge1xuICBEYXRhLmNhbGwodGhpcywgbmFtZSwgZGVmYXVsdFZhbHVlLCBvbkNoYW5nZSlcbn1cblxuaW5oZXJpdChGbG9hdERhdGEsIERhdGEpXG5cbkZsb2F0RGF0YS5wcm90b3R5cGUudHlwZSA9IFwiZmxvYXRcIlxuXG5GbG9hdERhdGEucHJvdG90eXBlLmNoZWNrVHlwZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09IFwibnVtYmVyXCJcbn1cblxuRmxvYXREYXRhLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gcGFyc2VGbG9hdCh2YWx1ZSlcbn1cblxuRmxvYXREYXRhLnByb3RvdHlwZS5zdHJpbmdpZnkgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIFwiXCIrdmFsdWVcbn1cbiIsInZhciBpbmhlcml0ID0gcmVxdWlyZShcIm1hdGNoYm94LWZhY3RvcnkvaW5oZXJpdFwiKVxudmFyIERhdGEgPSByZXF1aXJlKFwiLi4vRGF0YVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEpTT05EYXRhXG5cbmZ1bmN0aW9uIEpTT05EYXRhIChuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKSB7XG4gIERhdGEuY2FsbCh0aGlzLCBuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKVxufVxuXG5pbmhlcml0KEpTT05EYXRhLCBEYXRhKVxuXG5KU09ORGF0YS5wcm90b3R5cGUudHlwZSA9IFwianNvblwiXG5cbkpTT05EYXRhLnByb3RvdHlwZS5jaGVja1R5cGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGxcbn1cblxuSlNPTkRhdGEucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKVxufVxuXG5KU09ORGF0YS5wcm90b3R5cGUuc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcbn1cbiIsInZhciBpbmhlcml0ID0gcmVxdWlyZShcIm1hdGNoYm94LWZhY3RvcnkvaW5oZXJpdFwiKVxudmFyIERhdGEgPSByZXF1aXJlKFwiLi4vRGF0YVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE51bWJlckRhdGFcblxuZnVuY3Rpb24gTnVtYmVyRGF0YSAobmFtZSwgZGVmYXVsdFZhbHVlLCBvbkNoYW5nZSkge1xuICBEYXRhLmNhbGwodGhpcywgbmFtZSwgZGVmYXVsdFZhbHVlLCBvbkNoYW5nZSlcbn1cblxuaW5oZXJpdChOdW1iZXJEYXRhLCBEYXRhKVxuXG5OdW1iZXJEYXRhLnByb3RvdHlwZS50eXBlID0gXCJudW1iZXJcIlxuXG5OdW1iZXJEYXRhLnByb3RvdHlwZS5jaGVja1R5cGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSBcIm51bWJlclwiXG59XG5cbk51bWJlckRhdGEucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiBwYXJzZUludCh2YWx1ZSwgMTApXG59XG5cbk51bWJlckRhdGEucHJvdG90eXBlLnN0cmluZ2lmeSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gXCJcIit2YWx1ZVxufVxuIiwidmFyIGluaGVyaXQgPSByZXF1aXJlKFwibWF0Y2hib3gtZmFjdG9yeS9pbmhlcml0XCIpXG52YXIgRGF0YSA9IHJlcXVpcmUoXCIuLi9EYXRhXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gU3RyaW5nRGF0YVxuXG5mdW5jdGlvbiBTdHJpbmdEYXRhIChuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKSB7XG4gIERhdGEuY2FsbCh0aGlzLCBuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKVxufVxuXG5pbmhlcml0KFN0cmluZ0RhdGEsIERhdGEpXG5cblN0cmluZ0RhdGEucHJvdG90eXBlLnR5cGUgPSBcInN0cmluZ1wiXG5cblN0cmluZ0RhdGEucHJvdG90eXBlLmNoZWNrVHlwZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09IFwic3RyaW5nXCJcbn1cblxuU3RyaW5nRGF0YS5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID8gXCJcIit2YWx1ZSA6IFwiXCJcbn1cblxuU3RyaW5nRGF0YS5wcm90b3R5cGUuc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA/IFwiXCIrdmFsdWUgOiBcIlwiXG59XG4iLCJ2YXIgZGF0YSA9IG1vZHVsZS5leHBvcnRzID0ge31cblxuZGF0YS5Cb29sZWFuID0gcmVxdWlyZShcIi4vQm9vbGVhbkRhdGFcIilcbmRhdGEuU3RyaW5nID0gcmVxdWlyZShcIi4vU3RyaW5nRGF0YVwiKVxuZGF0YS5OdW1iZXIgPSByZXF1aXJlKFwiLi9OdW1iZXJEYXRhXCIpXG5kYXRhLkZsb2F0ID0gcmVxdWlyZShcIi4vRmxvYXREYXRhXCIpXG5kYXRhLkpTT04gPSByZXF1aXJlKFwiLi9KU09ORGF0YVwiKVxuXG5kYXRhLmNyZWF0ZSA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSwgb25DaGFuZ2UpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWVcblxuICBzd2l0Y2godHlwZSkge1xuICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgICByZXR1cm4gbmV3IGRhdGEuQm9vbGVhbihuYW1lLCB2YWx1ZSwgb25DaGFuZ2UpXG4gICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgcmV0dXJuIG5ldyBkYXRhLlN0cmluZyhuYW1lLCB2YWx1ZSwgb25DaGFuZ2UpXG4gICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgLy8gbm90ZTogaXQgZmFpbHMgZm9yIDEuMFxuICAgICAgaWYgKHZhbHVlID09PSArdmFsdWUgJiYgdmFsdWUgIT09ICh2YWx1ZSB8IDApKSB7XG4gICAgICAgIHJldHVybiBuZXcgZGF0YS5GbG9hdChuYW1lLCB2YWx1ZSwgb25DaGFuZ2UpXG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IGRhdGEuTnVtYmVyKG5hbWUsIHZhbHVlLCBvbkNoYW5nZSlcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG5ldyBkYXRhLkpTT04obmFtZSwgdmFsdWUsIG9uQ2hhbmdlKVxuICB9XG59XG4iLCJ2YXIgU2VsZWN0b3IgPSByZXF1aXJlKFwiLi4vU2VsZWN0b3JcIilcblxuLyoqXG4gKiBSZWdpc3RlcnMgYW4gZXZlbnQgbGlzdGVuZXIgb24gYW4gZWxlbWVudFxuICogYW5kIHJldHVybnMgYSBkZWxlZ2F0b3IuXG4gKiBBIGRlbGVnYXRlZCBldmVudCBydW5zIG1hdGNoZXMgdG8gZmluZCBhbiBldmVudCB0YXJnZXQsXG4gKiB0aGVuIGV4ZWN1dGVzIHRoZSBoYW5kbGVyIHBhaXJlZCB3aXRoIHRoZSBtYXRjaGVyLlxuICogTWF0Y2hlcnMgY2FuIGNoZWNrIGlmIGFuIGV2ZW50IHRhcmdldCBtYXRjaGVzIGEgZ2l2ZW4gc2VsZWN0b3IsXG4gKiBvciBzZWUgaWYgYW4gb2YgaXRzIHBhcmVudHMgZG8uXG4gKiAqL1xubW9kdWxlLmV4cG9ydHMgPSBkZWxlZ2F0ZVxuXG5mdW5jdGlvbiBkZWxlZ2F0ZSggb3B0aW9ucyApe1xuICB2YXIgZWxlbWVudCA9IG9wdGlvbnMuZWxlbWVudFxuICAgICwgZXZlbnQgPSBvcHRpb25zLmV2ZW50XG4gICAgLCBjYXB0dXJlID0gISFvcHRpb25zLmNhcHR1cmUgfHwgZmFsc2VcbiAgICAsIGNvbnRleHQgPSBvcHRpb25zLmNvbnRleHQgfHwgZWxlbWVudFxuICAgICwgdHJhbnNmb3JtID0gb3B0aW9ucy50cmFuc2Zvcm0gfHwgbnVsbFxuXG4gIGlmKCAhZWxlbWVudCApe1xuICAgIGNvbnNvbGUubG9nKFwiQ2FuJ3QgZGVsZWdhdGUgdW5kZWZpbmVkIGVsZW1lbnRcIilcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIGlmKCAhZXZlbnQgKXtcbiAgICBjb25zb2xlLmxvZyhcIkNhbid0IGRlbGVnYXRlIHVuZGVmaW5lZCBldmVudFwiKVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICB2YXIgaGFuZGxlciA9IGNyZWF0ZUhhbmRsZXIoY29udGV4dCwgdHJhbnNmb3JtKVxuICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIGNhcHR1cmUpXG5cbiAgcmV0dXJuIGhhbmRsZXJcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZGVsZWdhdG9yIHRoYXQgY2FuIGJlIHVzZWQgYXMgYW4gZXZlbnQgbGlzdGVuZXIuXG4gKiBUaGUgZGVsZWdhdG9yIGhhcyBzdGF0aWMgbWV0aG9kcyB3aGljaCBjYW4gYmUgdXNlZCB0byByZWdpc3RlciBoYW5kbGVycy5cbiAqICovXG5mdW5jdGlvbiBjcmVhdGVIYW5kbGVyKCBjb250ZXh0LCB0cmFuc2Zvcm0gKXtcbiAgdmFyIG1hdGNoZXJzID0gW11cblxuICBmdW5jdGlvbiBkZWxlZ2F0ZWRIYW5kbGVyKCBlICl7XG4gICAgdmFyIGwgPSBtYXRjaGVycy5sZW5ndGhcbiAgICBpZiggIWwgKXtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgdmFyIGVsID0gdGhpc1xuICAgICAgICAsIGkgPSAtMVxuICAgICAgICAsIGhhbmRsZXJcbiAgICAgICAgLCBzZWxlY3RvclxuICAgICAgICAsIGRlbGVnYXRlRWxlbWVudFxuICAgICAgICAsIHN0b3BQcm9wYWdhdGlvblxuICAgICAgICAsIGFyZ3NcblxuICAgIHdoaWxlKCArK2kgPCBsICl7XG4gICAgICBhcmdzID0gbWF0Y2hlcnNbaV1cbiAgICAgIGhhbmRsZXIgPSBhcmdzWzBdXG4gICAgICBzZWxlY3RvciA9IGFyZ3NbMV1cblxuICAgICAgZGVsZWdhdGVFbGVtZW50ID0gbWF0Y2hDYXB0dXJlUGF0aChzZWxlY3RvciwgZWwsIGUsIHRyYW5zZm9ybSwgY29udGV4dClcbiAgICAgIGlmKCBkZWxlZ2F0ZUVsZW1lbnQgJiYgZGVsZWdhdGVFbGVtZW50Lmxlbmd0aCApIHtcbiAgICAgICAgc3RvcFByb3BhZ2F0aW9uID0gZmFsc2UgPT09IGhhbmRsZXIuYXBwbHkoY29udGV4dCwgW2VdLmNvbmNhdChkZWxlZ2F0ZUVsZW1lbnQpKVxuICAgICAgICBpZiggc3RvcFByb3BhZ2F0aW9uICkge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBoYW5kbGVyIHdpdGggYSB0YXJnZXQgZmluZGVyIGxvZ2ljXG4gICAqICovXG4gIGRlbGVnYXRlZEhhbmRsZXIubWF0Y2ggPSBmdW5jdGlvbiggc2VsZWN0b3IsIGhhbmRsZXIgKXtcbiAgICBtYXRjaGVycy5wdXNoKFtoYW5kbGVyLCBzZWxlY3Rvcl0pXG4gICAgcmV0dXJuIGRlbGVnYXRlZEhhbmRsZXJcbiAgfVxuXG4gIHJldHVybiBkZWxlZ2F0ZWRIYW5kbGVyXG59XG5cbmZ1bmN0aW9uIG1hdGNoQ2FwdHVyZVBhdGgoIHNlbGVjdG9yLCBlbCwgZSwgdHJhbnNmb3JtLCBjb250ZXh0ICl7XG4gIHZhciBkZWxlZ2F0ZUVsZW1lbnRzID0gW11cbiAgdmFyIGRlbGVnYXRlRWxlbWVudCA9IG51bGxcbiAgaWYoIEFycmF5LmlzQXJyYXkoc2VsZWN0b3IpICl7XG4gICAgdmFyIGkgPSAtMVxuICAgIHZhciBsID0gc2VsZWN0b3IubGVuZ3RoXG4gICAgd2hpbGUoICsraSA8IGwgKXtcbiAgICAgIGRlbGVnYXRlRWxlbWVudCA9IGZpbmRQYXJlbnQoc2VsZWN0b3JbaV0sIGVsLCBlKVxuICAgICAgaWYoICFkZWxlZ2F0ZUVsZW1lbnQgKSByZXR1cm4gbnVsbFxuICAgICAgaWYgKHR5cGVvZiB0cmFuc2Zvcm0gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGRlbGVnYXRlRWxlbWVudCA9IHRyYW5zZm9ybShjb250ZXh0LCBzZWxlY3RvciwgZGVsZWdhdGVFbGVtZW50KVxuICAgICAgfVxuICAgICAgZGVsZWdhdGVFbGVtZW50cy5wdXNoKGRlbGVnYXRlRWxlbWVudClcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgZGVsZWdhdGVFbGVtZW50ID0gZmluZFBhcmVudChzZWxlY3RvciwgZWwsIGUpXG4gICAgaWYoICFkZWxlZ2F0ZUVsZW1lbnQgKSByZXR1cm4gbnVsbFxuICAgIGlmICh0eXBlb2YgdHJhbnNmb3JtID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgZGVsZWdhdGVFbGVtZW50ID0gdHJhbnNmb3JtKGNvbnRleHQsIHNlbGVjdG9yLCBkZWxlZ2F0ZUVsZW1lbnQpXG4gICAgfVxuICAgIGRlbGVnYXRlRWxlbWVudHMucHVzaChkZWxlZ2F0ZUVsZW1lbnQpXG4gIH1cbiAgcmV0dXJuIGRlbGVnYXRlRWxlbWVudHNcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgdGFyZ2V0IG9yIGFueSBvZiBpdHMgcGFyZW50IG1hdGNoZXMgYSBzZWxlY3RvclxuICogKi9cbmZ1bmN0aW9uIGZpbmRQYXJlbnQoIHNlbGVjdG9yLCBlbCwgZSApe1xuICB2YXIgdGFyZ2V0ID0gZS50YXJnZXRcbiAgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgU2VsZWN0b3IpIHtcbiAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnRvU3RyaW5nKClcbiAgfVxuICBzd2l0Y2goIHR5cGVvZiBzZWxlY3RvciApe1xuICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgIHdoaWxlKCB0YXJnZXQgJiYgdGFyZ2V0ICE9IGVsICl7XG4gICAgICAgIGlmKCB0YXJnZXQubWF0Y2hlcyAmJiB0YXJnZXQubWF0Y2hlcyhzZWxlY3RvcikgKSByZXR1cm4gdGFyZ2V0XG4gICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgXCJmdW5jdGlvblwiOlxuICAgICAgd2hpbGUoIHRhcmdldCAmJiB0YXJnZXQgIT0gZWwgKXtcbiAgICAgICAgaWYoIHNlbGVjdG9yLmNhbGwoZWwsIHRhcmdldCkgKSByZXR1cm4gdGFyZ2V0XG4gICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbFxuICB9XG4gIHJldHVybiBudWxsXG59XG4iLCJ2YXIgbWVyZ2UgPSByZXF1aXJlKFwibWF0Y2hib3gtdXRpbC9vYmplY3QvbWVyZ2VcIilcbnZhciBmb3JJbiA9IHJlcXVpcmUoXCJtYXRjaGJveC11dGlsL29iamVjdC9pblwiKVxudmFyIEV4dGVuc2lvbiA9IHJlcXVpcmUoXCIuL0V4dGVuc2lvblwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJsdWVwcmludFxuXG5mdW5jdGlvbiBCbHVlcHJpbnQoIGJsb2NrcywgcGFyZW50ICl7XG4gIHZhciBibHVlcHJpbnQgPSB0aGlzXG5cbiAgdGhpcy5ibG9ja3MgPSBtZXJnZShibG9ja3MpXG4gIHRoaXMucGFyZW50ID0gcGFyZW50XG5cbiAgdGhpcy5sb2NhbEV4dGVuc2lvbnMgPSB0aGlzLmdldChcImV4dGVuc2lvbnNcIiwge30pXG5cbiAgZm9ySW4odGhpcy5sb2NhbEV4dGVuc2lvbnMsIGZ1bmN0aW9uKCBuYW1lLCBleHRlbnNpb24gKXtcbiAgICAvL2lmIChwYXJlbnQgJiYgISF+cGFyZW50LmV4dGVuc2lvbk5hbWVzLmluZGV4T2YobmFtZSkpIHtcbiAgICAvLyAgdGhyb3cgbmV3IEVycm9yKFwiRGVzY3JpcHRpb24gb3ZlcnJpZGUgaXMgbm90IHN1cHBvcnRlZFwiKVxuICAgIC8vfVxuXG4gICAgZXh0ZW5zaW9uID0gZXh0ZW5zaW9uIGluc3RhbmNlb2YgRXh0ZW5zaW9uXG4gICAgICAgID8gZXh0ZW5zaW9uXG4gICAgICAgIDogbmV3IEV4dGVuc2lvbihleHRlbnNpb24pXG4gICAgYmx1ZXByaW50LmxvY2FsRXh0ZW5zaW9uc1tuYW1lXSA9IGV4dGVuc2lvblxuICAgIGV4dGVuc2lvbi5uYW1lID0gbmFtZVxuICB9KVxuXG4gIHRoaXMuZ2xvYmFsRXh0ZW5zaW9ucyA9IHRoaXMubG9jYWxFeHRlbnNpb25zXG5cbiAgaWYgKHBhcmVudCkge1xuICAgIHRoaXMuZ2xvYmFsRXh0ZW5zaW9ucyA9IG1lcmdlKHBhcmVudC5nbG9iYWxFeHRlbnNpb25zLCB0aGlzLmxvY2FsRXh0ZW5zaW9ucylcbiAgICBmb3JJbih0aGlzLmdsb2JhbEV4dGVuc2lvbnMsIGZ1bmN0aW9uIChuYW1lLCBleHRlbnNpb24pIHtcbiAgICAgIGlmIChleHRlbnNpb24uaW5oZXJpdCkge1xuICAgICAgICBibHVlcHJpbnQuYmxvY2tzW25hbWVdID0gbWVyZ2UocGFyZW50LmdldChuYW1lKSwgYmx1ZXByaW50LmdldChuYW1lKSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbkJsdWVwcmludC5wcm90b3R5cGUuYnVpbGRQcm90b3R5cGUgPSBmdW5jdGlvbiggcHJvdG90eXBlLCB0b3AgKXtcbiAgdGhpcy5idWlsZChcInByb3RvdHlwZVwiLCB0aGlzLmdsb2JhbEV4dGVuc2lvbnMsIHRvcCwgZnVuY3Rpb24gKG5hbWUsIGV4dGVuc2lvbiwgYmxvY2spIHtcbiAgICBmb3JJbihibG9jaywgZnVuY3Rpb24oIG5hbWUsIHZhbHVlICl7XG4gICAgICBleHRlbnNpb24uaW5pdGlhbGl6ZShwcm90b3R5cGUsIG5hbWUsIHZhbHVlKVxuICAgIH0pXG4gIH0pXG59XG5cbkJsdWVwcmludC5wcm90b3R5cGUuYnVpbGRDYWNoZSA9IGZ1bmN0aW9uKCBwcm90b3R5cGUsIHRvcCApe1xuICB0aGlzLmJ1aWxkKFwiY2FjaGVcIiwgdGhpcy5nbG9iYWxFeHRlbnNpb25zLCB0b3AsIGZ1bmN0aW9uIChuYW1lLCBleHRlbnNpb24sIGJsb2NrKSB7XG4gICAgaWYgKCFwcm90b3R5cGUuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIHByb3RvdHlwZVtuYW1lXSA9IHt9XG4gICAgfVxuXG4gICAgdmFyIGNhY2hlID0gcHJvdG90eXBlW25hbWVdXG4gICAgdmFyIGluaXRpYWxpemUgPSBleHRlbnNpb24uaW5pdGlhbGl6ZVxuXG4gICAgZm9ySW4oYmxvY2ssIGZ1bmN0aW9uKCBuYW1lLCB2YWx1ZSApe1xuICAgICAgY2FjaGVbbmFtZV0gPSBpbml0aWFsaXplXG4gICAgICAgICAgPyBpbml0aWFsaXplKHByb3RvdHlwZSwgbmFtZSwgdmFsdWUpXG4gICAgICAgICAgOiB2YWx1ZVxuICAgIH0pXG4gIH0pXG59XG5cbkJsdWVwcmludC5wcm90b3R5cGUuYnVpbGRJbnN0YW5jZSA9IGZ1bmN0aW9uKCBpbnN0YW5jZSwgdG9wICl7XG4gIHRoaXMuYnVpbGQoXCJpbnN0YW5jZVwiLCB0aGlzLmxvY2FsRXh0ZW5zaW9ucywgdG9wLCBmdW5jdGlvbiAobmFtZSwgZXh0ZW5zaW9uLCBibG9jaykge1xuICAgIGZvckluKGJsb2NrLCBmdW5jdGlvbiggbmFtZSwgdmFsdWUgKXtcbiAgICAgIGV4dGVuc2lvbi5pbml0aWFsaXplKGluc3RhbmNlLCBuYW1lLCB2YWx1ZSlcbiAgICB9KVxuICB9KVxufVxuXG5CbHVlcHJpbnQucHJvdG90eXBlLmJ1aWxkID0gZnVuY3Rpb24oIHR5cGUsIGV4dGVuc2lvbnMsIHRvcCwgYnVpbGQgKXtcbiAgdmFyIGJsdWVwcmludCA9IHRvcCB8fCB0aGlzXG4gIC8vdmFyIGJhc2UgPSB0aGlzXG4gIGZvckluKGV4dGVuc2lvbnMsIGZ1bmN0aW9uIChuYW1lLCBleHRlbnNpb24pIHtcbiAgICBpZiggZXh0ZW5zaW9uLnR5cGUgIT0gdHlwZSApIHJldHVyblxuICAgIC8vdmFyIGJsdWVwcmludCA9IGV4dGVuc2lvbi5pbmhlcml0ID8gdG9wIDogYmFzZVxuICAgIHZhciBibG9jayA9IGJsdWVwcmludC5nZXQobmFtZSlcbiAgICBpZiggIWJsb2NrICkgcmV0dXJuXG5cbiAgICBidWlsZChuYW1lLCBleHRlbnNpb24sIGJsb2NrKVxuICB9KVxufVxuXG5CbHVlcHJpbnQucHJvdG90eXBlLmRpZ2VzdCA9IGZ1bmN0aW9uKCBuYW1lLCBmbiwgbG9vcCApe1xuICBpZiAodGhpcy5oYXMobmFtZSkpIHtcbiAgICB2YXIgYmxvY2sgPSB0aGlzLmdldChuYW1lKVxuICAgIGlmIChsb29wKSB7XG4gICAgICBmb3JJbihibG9jaywgZm4pXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZm4uY2FsbCh0aGlzLCBibG9jaylcbiAgICB9XG4gIH1cbn1cblxuQmx1ZXByaW50LnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiggbmFtZSApe1xuICByZXR1cm4gdGhpcy5ibG9ja3MuaGFzT3duUHJvcGVydHkobmFtZSkgJiYgdGhpcy5ibG9ja3NbbmFtZV0gIT0gbnVsbFxufVxuXG5CbHVlcHJpbnQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKCBuYW1lLCBkZWZhdWx0VmFsdWUgKXtcbiAgaWYoIHRoaXMuaGFzKG5hbWUpICl7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tzW25hbWVdXG4gIH1cbiAgZWxzZSByZXR1cm4gZGVmYXVsdFZhbHVlXG59XG4iLCJ2YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCIuL2luaGVyaXRcIilcbnZhciBFeHRlbnNpb24gPSByZXF1aXJlKFwiLi9FeHRlbnNpb25cIilcblxubW9kdWxlLmV4cG9ydHMgPSBDYWNoZUV4dGVuc2lvblxuXG5mdW5jdGlvbiBDYWNoZUV4dGVuc2lvbiAoaW5pdGlhbGl6ZSkge1xuICBFeHRlbnNpb24uY2FsbCh0aGlzLCB7XG4gICAgdHlwZTogXCJjYWNoZVwiLFxuICAgIGluaGVyaXQ6IHRydWUsXG4gICAgaW5pdGlhbGl6ZTogaW5pdGlhbGl6ZVxuICB9KVxufVxuXG5pbmhlcml0KENhY2hlRXh0ZW5zaW9uLCBFeHRlbnNpb24pXG4iLCJtb2R1bGUuZXhwb3J0cyA9IEV4dGVuc2lvblxuXG5mdW5jdGlvbiBFeHRlbnNpb24oZXh0ZW5zaW9uKXtcbiAgZXh0ZW5zaW9uID0gZXh0ZW5zaW9uIHx8IHt9XG4gIHRoaXMubmFtZSA9IFwiXCJcbiAgdGhpcy50eXBlID0gZXh0ZW5zaW9uLnR5cGUgfHwgXCJpbnN0YW5jZVwiXG4gIHRoaXMuaW5oZXJpdCA9IGV4dGVuc2lvbi5pbmhlcml0IHx8IGZhbHNlXG4gIHRoaXMuaW5pdGlhbGl6ZSA9IGV4dGVuc2lvbi5pbml0aWFsaXplIHx8IG51bGxcbn1cbiIsInZhciBkZWZpbmUgPSByZXF1aXJlKFwibWF0Y2hib3gtdXRpbC9vYmplY3QvZGVmaW5lXCIpXG52YXIgZXh0ZW5kT2JqZWN0ID0gcmVxdWlyZShcIm1hdGNoYm94LXV0aWwvb2JqZWN0L2V4dGVuZFwiKVxudmFyIEJsdWVwcmludCA9IHJlcXVpcmUoXCIuL0JsdWVwcmludFwiKVxudmFyIGV4dGVuZCA9IHJlcXVpcmUoXCIuL2V4dGVuZFwiKVxudmFyIGF1Z21lbnQgPSByZXF1aXJlKFwiLi9hdWdtZW50XCIpXG52YXIgaW5jbHVkZSA9IHJlcXVpcmUoXCIuL2luY2x1ZGVcIilcbnZhciBpbmhlcml0ID0gcmVxdWlyZShcIi4vaW5oZXJpdFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY3RvcnlcblxuZnVuY3Rpb24gRmFjdG9yeSggYmx1ZXByaW50LCBwYXJlbnQgKXtcbiAgdmFyIGZhY3RvcnkgPSB0aGlzXG5cbiAgaWYoICEoYmx1ZXByaW50IGluc3RhbmNlb2YgQmx1ZXByaW50KSApIHtcbiAgICBibHVlcHJpbnQgPSBuZXcgQmx1ZXByaW50KGJsdWVwcmludCwgcGFyZW50ID8gcGFyZW50LmJsdWVwcmludCA6IG51bGwpXG4gIH1cblxuICB0aGlzLmJsdWVwcmludCA9IGJsdWVwcmludFxuICB0aGlzLnBhcmVudCA9IHBhcmVudCB8fCBudWxsXG4gIHRoaXMuYW5jZXN0b3JzID0gcGFyZW50ID8gcGFyZW50LmFuY2VzdG9ycy5jb25jYXQoW3BhcmVudF0pIDogW11cbiAgdGhpcy5yb290ID0gdGhpcy5hbmNlc3RvcnNbMF0gfHwgbnVsbFxuICB0aGlzLlN1cGVyID0gYmx1ZXByaW50LmdldChcImluaGVyaXRcIiwgbnVsbClcbiAgdGhpcy5Db25zdHJ1Y3RvciA9IGJsdWVwcmludC5nZXQoXCJjb25zdHJ1Y3RvclwiLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGZhY3RvcnkuU3VwZXIpIHtcbiAgICAgIGZhY3RvcnkuU3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIH1cbiAgICB0aGlzLmNvbnN0cnVjdG9yLmluaXRpYWxpemUodGhpcylcbiAgfSlcbiAgdGhpcy5Db25zdHJ1Y3Rvci5leHRlbmQgPSBmdW5jdGlvbiAoc3VwZXJCbHVlcHJpbnQpIHtcbiAgICBzdXBlckJsdWVwcmludCA9IHN1cGVyQmx1ZXByaW50IHx8IHt9XG4gICAgc3VwZXJCbHVlcHJpbnRbXCJpbmhlcml0XCJdID0gZmFjdG9yeS5Db25zdHJ1Y3RvclxuICAgIHZhciBzdXBlckZhY3RvcnkgPSBuZXcgRmFjdG9yeShzdXBlckJsdWVwcmludCwgZmFjdG9yeSlcbiAgICByZXR1cm4gc3VwZXJGYWN0b3J5LmFzc2VtYmxlKClcbiAgfVxuXG4gIHRoaXMuaW5kdXN0cnkucHVzaCh0aGlzKVxufVxuXG5GYWN0b3J5LnByb3RvdHlwZS5hc3NlbWJsZSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBmYWN0b3J5ID0gdGhpc1xuICB2YXIgYmx1ZXByaW50ID0gdGhpcy5ibHVlcHJpbnRcbiAgdmFyIENvbnN0cnVjdG9yID0gdGhpcy5Db25zdHJ1Y3RvclxuXG4gIENvbnN0cnVjdG9yLlN1cGVyID0gdGhpcy5TdXBlclxuICBDb25zdHJ1Y3Rvci5ibHVlcHJpbnQgPSBibHVlcHJpbnRcblxuICB0aGlzLmRpZ2VzdCgpXG5cbiAgYmx1ZXByaW50LmJ1aWxkUHJvdG90eXBlKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgYmx1ZXByaW50KVxuICBibHVlcHJpbnQuYnVpbGRDYWNoZShDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIGJsdWVwcmludClcblxuICBDb25zdHJ1Y3Rvci5pbml0aWFsaXplID0gZnVuY3Rpb24gKGluc3RhbmNlKSB7XG4gICAgLy92YXIgdG9wID0gZmFjdG9yeS5maW5kRmFjdG9yeShpbnN0YW5jZS5jb25zdHJ1Y3RvcikuYmx1ZXByaW50XG4gICAgdmFyIHRvcCA9IGluc3RhbmNlLmNvbnN0cnVjdG9yLmJsdWVwcmludFxuICAgIGJsdWVwcmludC5idWlsZEluc3RhbmNlKGluc3RhbmNlLCB0b3ApXG4gIH1cblxuICByZXR1cm4gQ29uc3RydWN0b3Jcbn1cblxuRmFjdG9yeS5wcm90b3R5cGUuZGlnZXN0ID0gZnVuY3Rpb24oICApe1xuICB2YXIgZmFjdG9yeSA9IHRoaXNcbiAgdmFyIGJsdWVwcmludCA9IHRoaXMuYmx1ZXByaW50XG4gIHZhciBDb25zdHJ1Y3RvciA9IHRoaXMuQ29uc3RydWN0b3JcbiAgdmFyIHByb3RvID0gQ29uc3RydWN0b3IucHJvdG90eXBlXG5cbiAgYmx1ZXByaW50LmRpZ2VzdChcImluaGVyaXRcIiwgZnVuY3Rpb24gKFN1cGVyKSB7XG4gICAgaW5oZXJpdChDb25zdHJ1Y3RvciwgU3VwZXIpXG4gIH0pXG4gIGJsdWVwcmludC5kaWdlc3QoXCJpbmNsdWRlXCIsIGZ1bmN0aW9uIChpbmNsdWRlcykge1xuICAgIGluY2x1ZGUoQ29uc3RydWN0b3IsIGluY2x1ZGVzKVxuICB9KVxuICBibHVlcHJpbnQuZGlnZXN0KFwiYXVnbWVudFwiLCBmdW5jdGlvbiAoYXVnbWVudHMpIHtcbiAgICBhdWdtZW50KENvbnN0cnVjdG9yLCBhdWdtZW50cylcbiAgfSlcbiAgYmx1ZXByaW50LmRpZ2VzdChcInByb3RvdHlwZVwiLCBmdW5jdGlvbiAocHJvdG8pIHtcbiAgICBleHRlbmQoQ29uc3RydWN0b3IsIHByb3RvKVxuICB9KVxuICBpZiAoYmx1ZXByaW50LnBhcmVudCkge1xuICAgIGV4dGVuZE9iamVjdChDb25zdHJ1Y3RvciwgYmx1ZXByaW50LnBhcmVudC5nZXQoXCJzdGF0aWNcIikpXG4gIH1cbiAgYmx1ZXByaW50LmRpZ2VzdChcInN0YXRpY1wiLCBmdW5jdGlvbiAobWV0aG9kcykge1xuICAgIGV4dGVuZE9iamVjdChDb25zdHJ1Y3RvciwgbWV0aG9kcylcbiAgfSlcbiAgYmx1ZXByaW50LmRpZ2VzdChcImFjY2Vzc29yXCIsIGZ1bmN0aW9uKCBuYW1lLCBhY2Nlc3MgKXtcbiAgICBpZiggIWFjY2VzcyApIHJldHVyblxuICAgIGlmKCB0eXBlb2YgYWNjZXNzID09IFwiZnVuY3Rpb25cIiApe1xuICAgICAgZGVmaW5lLmdldHRlcihwcm90bywgbmFtZSwgYWNjZXNzKVxuICAgIH1cbiAgICBlbHNlIGlmKCB0eXBlb2YgYWNjZXNzW1wiZ2V0XCJdID09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgYWNjZXNzW1wic2V0XCJdID09IFwiZnVuY3Rpb25cIiApe1xuICAgICAgZGVmaW5lLmFjY2Vzc29yKHByb3RvLCBuYW1lLCBhY2Nlc3NbXCJnZXRcIl0sIGFjY2Vzc1tcInNldFwiXSlcbiAgICB9XG4gICAgZWxzZSBpZiggdHlwZW9mIGFjY2Vzc1tcImdldFwiXSA9PSBcImZ1bmN0aW9uXCIgKXtcbiAgICAgIGRlZmluZS5nZXR0ZXIocHJvdG8sIG5hbWUsIGFjY2Vzc1tcImdldFwiXSlcbiAgICB9XG4gICAgZWxzZSBpZiggdHlwZW9mIGFjY2Vzc1tcInNldFwiXSA9PSBcImZ1bmN0aW9uXCIgKXtcbiAgICAgIGRlZmluZS5nZXR0ZXIocHJvdG8sIG5hbWUsIGFjY2Vzc1tcInNldFwiXSlcbiAgICB9XG4gIH0sIHRydWUpXG4gIC8vYmx1ZXByaW50LmRpZ2VzdChcImluY2x1ZGVcIiwgZnVuY3Rpb24gKGluY2x1ZGVzKSB7XG4gIC8vICBpZiAoIUFycmF5LmlzQXJyYXkoaW5jbHVkZXMpKSB7XG4gIC8vICAgIGluY2x1ZGVzID0gW2luY2x1ZGVzXVxuICAvLyAgfVxuICAvLyAgaW5jbHVkZXMuZm9yRWFjaChmdW5jdGlvbiAoaW5jbHVkZSkge1xuICAvLyAgICB2YXIgZm9yZWlnbiA9IGZhY3RvcnkuZmluZEZhY3RvcnkoaW5jbHVkZSlcbiAgLy8gICAgaWYgKGZvcmVpZ24pIHtcbiAgLy8gICAgICBmb3JlaWduLmJsdWVwcmludC5idWlsZChcInByb3RvdHlwZVwiLCBDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIGJsdWVwcmludClcbiAgLy8gICAgfVxuICAvLyAgfSlcbiAgLy99KVxufVxuXG5GYWN0b3J5LnByb3RvdHlwZS5pbmR1c3RyeSA9IFtdXG5cbkZhY3RvcnkucHJvdG90eXBlLmZpbmRGYWN0b3J5ID0gZnVuY3Rpb24oIENvbnN0cnVjdG9yICl7XG4gIHZhciByZXQgPSBudWxsXG4gIHRoaXMuaW5kdXN0cnkuc29tZShmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIHJldHVybiBmYWN0b3J5LkNvbnN0cnVjdG9yID09PSBDb25zdHJ1Y3RvciAmJiAocmV0ID0gZmFjdG9yeSlcbiAgfSlcbiAgcmV0dXJuIHJldFxufVxuIiwidmFyIGluaGVyaXQgPSByZXF1aXJlKFwiLi9pbmhlcml0XCIpXG52YXIgRXh0ZW5zaW9uID0gcmVxdWlyZShcIi4vRXh0ZW5zaW9uXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdGFuY2VFeHRlbnNpb25cblxuZnVuY3Rpb24gSW5zdGFuY2VFeHRlbnNpb24gKGluaXRpYWxpemUpIHtcbiAgRXh0ZW5zaW9uLmNhbGwodGhpcywge1xuICAgIHR5cGU6IFwiaW5zdGFuY2VcIixcbiAgICBpbmhlcml0OiB0cnVlLFxuICAgIGluaXRpYWxpemU6IGluaXRpYWxpemVcbiAgfSlcbn1cblxuaW5oZXJpdChJbnN0YW5jZUV4dGVuc2lvbiwgRXh0ZW5zaW9uKVxuIiwidmFyIGluaGVyaXQgPSByZXF1aXJlKFwiLi9pbmhlcml0XCIpXG52YXIgRXh0ZW5zaW9uID0gcmVxdWlyZShcIi4vRXh0ZW5zaW9uXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlRXh0ZW5zaW9uXG5cbmZ1bmN0aW9uIFByb3RvdHlwZUV4dGVuc2lvbiAoaW5pdGlhbGl6ZSkge1xuICBFeHRlbnNpb24uY2FsbCh0aGlzLCB7XG4gICAgdHlwZTogXCJwcm90b3R5cGVcIixcbiAgICBpbmhlcml0OiBmYWxzZSxcbiAgICBpbml0aWFsaXplOiBpbml0aWFsaXplXG4gIH0pXG59XG5cbmluaGVyaXQoUHJvdG90eXBlRXh0ZW5zaW9uLCBFeHRlbnNpb24pXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGF1Z21lbnQgKENsYXNzLCBtaXhpbikge1xuICBpZiAoQXJyYXkuaXNBcnJheShtaXhpbikpIHtcbiAgICBtaXhpbi5mb3JFYWNoKGZ1bmN0aW9uIChtaXhpbikge1xuICAgICAgaWYgKHR5cGVvZiBtaXhpbiA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgbWl4aW4uY2FsbChDbGFzcy5wcm90b3R5cGUpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBlbHNlIHtcbiAgICBpZiAodHlwZW9mIG1peGluID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgbWl4aW4uY2FsbChDbGFzcy5wcm90b3R5cGUpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIENsYXNzXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZCAoQ2xhc3MsIHByb3RvdHlwZSkge1xuICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwcm90b3R5cGUpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gXCJjb25zdHJ1Y3RvclwiICkge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHByb3RvdHlwZSwgbmFtZSlcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDbGFzcy5wcm90b3R5cGUsIG5hbWUsIGRlc2NyaXB0b3IpXG4gICAgfVxuICB9KVxuXG4gIHJldHVybiBDbGFzc1xufVxuIiwidmFyIGV4dGVuZCA9IHJlcXVpcmUoXCIuL2V4dGVuZFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluY2x1ZGUgKENsYXNzLCBPdGhlcikge1xuICBpZiAoQXJyYXkuaXNBcnJheShPdGhlcikpIHtcbiAgICBPdGhlci5mb3JFYWNoKGZ1bmN0aW9uIChPdGhlcikge1xuICAgICAgaWYgKHR5cGVvZiBPdGhlciA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgZXh0ZW5kKENsYXNzLCBPdGhlci5wcm90b3R5cGUpXG4gICAgICB9XG4gICAgICBlbHNlIGlmICh0eXBlb2YgT3RoZXIgPT0gXCJvYmplY3RcIikge1xuICAgICAgICBleHRlbmQoQ2xhc3MsIE90aGVyKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBPdGhlciA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGV4dGVuZChDbGFzcywgT3RoZXIucHJvdG90eXBlKVxuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgT3RoZXIgPT0gXCJvYmplY3RcIikge1xuICAgICAgZXh0ZW5kKENsYXNzLCBPdGhlcilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gQ2xhc3Ncbn1cbiIsInZhciBGYWN0b3J5ID0gcmVxdWlyZShcIi4vRmFjdG9yeVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnlcblxuZmFjdG9yeS5DYWNoZUV4dGVuc2lvbiA9IHJlcXVpcmUoXCIuL0NhY2hlRXh0ZW5zaW9uXCIpXG5mYWN0b3J5Lkluc3RhbmNlRXh0ZW5zaW9uID0gcmVxdWlyZShcIi4vSW5zdGFuY2VFeHRlbnNpb25cIilcbmZhY3RvcnkuUHJvdG90eXBlRXh0ZW5zaW9uID0gcmVxdWlyZShcIi4vUHJvdG90eXBlRXh0ZW5zaW9uXCIpXG5cbmZ1bmN0aW9uIGZhY3RvcnkoIGJsdWVwcmludCApe1xuICByZXR1cm4gbmV3IEZhY3RvcnkoYmx1ZXByaW50KS5hc3NlbWJsZSgpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXQgKENsYXNzLCBCYXNlKSB7XG4gIENsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZS5wcm90b3R5cGUpXG4gIENsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENsYXNzXG5cbiAgcmV0dXJuIENsYXNzXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IENoYW5uZWxcblxuZnVuY3Rpb24gQ2hhbm5lbCggbmFtZSApe1xuICB0aGlzLm5hbWUgPSBuYW1lIHx8IFwiXCJcbn1cblxuQ2hhbm5lbC5wcm90b3R5cGUgPSBbXVxuQ2hhbm5lbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaGFubmVsXG5cbkNoYW5uZWwucHJvdG90eXBlLnB1Ymxpc2ggPSBDaGFubmVsLnByb3RvdHlwZS5icm9hZGNhc3QgPSBmdW5jdGlvbiggICl7XG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLnNsaWNlKClcbiAgdmFyIGwgPSBsaXN0ZW5lcnMubGVuZ3RoXG4gIGlmKCAhbCApe1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgdmFyIGVyciA9IG51bGxcbiAgdmFyIGkgPSAtMVxuICB2YXIgbGlzdGVuZXJcblxuICB3aGlsZSggKytpIDwgbCApe1xuICAgIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldXG4gICAgaWYoIGxpc3RlbmVyLnByb3h5ICkgbGlzdGVuZXIgPSBsaXN0ZW5lci5wcm94eVxuICAgIGVyciA9IGxpc3RlbmVyLmFwcGx5KG51bGwsIGFyZ3VtZW50cylcbiAgICBpZiggZXJyICE9IG51bGwgKSByZXR1cm4gZXJyXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cbkNoYW5uZWwucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uKCBsaXN0ZW5lciApe1xuICBpZiggdHlwZW9mIGxpc3RlbmVyICE9IFwiZnVuY3Rpb25cIiApe1xuICAgIGNvbnNvbGUud2FybihcIkxpc3RlbmVyIGlzIG5vdCBhIGZ1bmN0aW9uXCIsIGxpc3RlbmVyKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBpZiggIXRoaXMuaXNTdWJzY3JpYmVkKGxpc3RlbmVyKSApIHtcbiAgICB0aGlzLnB1c2gobGlzdGVuZXIpXG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuQ2hhbm5lbC5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiggbGlzdGVuZXIgKXtcbiAgdmFyIGkgPSB0aGlzLmluZGV4T2YobGlzdGVuZXIpXG4gIGlmKCB+aSApIHRoaXMuc3BsaWNlKGksIDEpXG4gIHJldHVybiB0aGlzXG59XG5DaGFubmVsLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oIGxpc3RlbmVyICl7XG4gIHZhciBjaGFubmVsID0gdGhpc1xuXG4gIC8vIHBpZ2d5YmFjayBvbiB0aGUgbGlzdGVuZXJcbiAgbGlzdGVuZXIucHJveHkgPSBmdW5jdGlvbiBwcm94eSggICl7XG4gICAgdmFyIHJldCA9IGxpc3RlbmVyLmFwcGx5KG51bGwsIGFyZ3VtZW50cylcbiAgICBjaGFubmVsLnVuc3Vic2NyaWJlKGxpc3RlbmVyKVxuICAgIHJldHVybiByZXRcbiAgfVxuICB0aGlzLnN1YnNjcmliZShsaXN0ZW5lcilcblxuICByZXR1cm4gdGhpc1xufVxuQ2hhbm5lbC5wcm90b3R5cGUuaXNTdWJzY3JpYmVkID0gZnVuY3Rpb24oIGxpc3RlbmVyICl7XG4gIHJldHVybiAhIShsaXN0ZW5lciAmJiB+dGhpcy5pbmRleE9mKGxpc3RlbmVyKSlcbn1cbkNoYW5uZWwucHJvdG90eXBlLmhhc1N1YnNjcmliZXJzID0gZnVuY3Rpb24oICApe1xuICByZXR1cm4gdGhpcy5sZW5ndGggPiAwXG59XG5DaGFubmVsLnByb3RvdHlwZS5lbXB0eSA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuc3BsaWNlKDApXG4gIHJldHVybiB0aGlzXG59XG4iLCJ2YXIgQ2hhbm5lbCA9IHJlcXVpcmUoXCIuL0NoYW5uZWxcIilcblxubW9kdWxlLmV4cG9ydHMgPSBSYWRpb1xuXG5mdW5jdGlvbiBSYWRpbyggICl7XG4gIHRoaXMuX2NoYW5uZWxzID0gW11cbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBjaGFubmVsIGlmIGl0IGRvZXNuJ3QgZXhpc3QgYWxyZWFkeVxuICogYW5kIHJldHVybiB0aGUgY2hhbm5lbC5cbiAqICovXG5SYWRpby5wcm90b3R5cGUuY2hhbm5lbCA9IGZ1bmN0aW9uKCBjaGFubmVsICl7XG4gIHJldHVybiB0aGlzLl9jaGFubmVsc1tjaGFubmVsXVxuICAgICAgfHwgKHRoaXMuX2NoYW5uZWxzW2NoYW5uZWxdID0gbmV3IENoYW5uZWwoY2hhbm5lbCkpXG59XG4vKipcbiAqIENoZWNrIGlmIGEgY2hhbm5lbCBleGlzdHMuXG4gKiAqL1xuUmFkaW8ucHJvdG90eXBlLmNoYW5uZWxFeGlzdHMgPSBmdW5jdGlvbiggY2hhbm5lbCApe1xuICByZXR1cm4gISFjaGFubmVsICYmICh0eXBlb2YgY2hhbm5lbCA9PSBcInN0cmluZ1wiXG4gICAgICAgICAgPyB0aGlzLl9jaGFubmVscy5oYXNPd25Qcm9wZXJ0eShjaGFubmVsKVxuICAgICAgICAgIDogdGhpcy5fY2hhbm5lbHMuaGFzT3duUHJvcGVydHkoY2hhbm5lbC5uYW1lKSlcbn1cbi8qKlxuICogRGVsZXRlIGEgY2hhbm5lbC5cbiAqICovXG5SYWRpby5wcm90b3R5cGUuZGVsZXRlQ2hhbm5lbCA9IGZ1bmN0aW9uKCBjaGFubmVsICl7XG4gIGlmKCBjaGFubmVsIGluc3RhbmNlb2YgQ2hhbm5lbCApe1xuICAgIHJldHVybiBkZWxldGUgdGhpcy5fY2hhbm5lbHNbY2hhbm5lbC5uYW1lXVxuICB9XG4gIHJldHVybiBkZWxldGUgdGhpcy5fY2hhbm5lbHNbY2hhbm5lbF1cbn1cbi8qKlxuICogQ2hlY2sgaWYgYSBjaGFubmVsIGhhcyBhbnkgc3Vic2NyaWJlcnMuXG4gKiBJZiB0aGUgY2hhbm5lbCBkb2Vzbid0IGV4aXN0cyBpdCdzIGBmYWxzZWAuXG4gKiAqL1xuUmFkaW8ucHJvdG90eXBlLmhhc1N1YnNjcmliZXJzID0gZnVuY3Rpb24oIGNoYW5uZWwgKXtcbiAgcmV0dXJuIHRoaXMuY2hhbm5lbEV4aXN0cyhjaGFubmVsKSAmJiB0aGlzLmNoYW5uZWwoY2hhbm5lbCkuaGFzU3Vic2NyaWJlcnMoKVxufVxuLyoqXG4gKiBDaGVjayBpZiBhIGxpc3RlbmVyIGlzIHN1YnNjcmliZWQgdG8gYSBjaGFubmVsLlxuICogSWYgdGhlIGNoYW5uZWwgZG9lc24ndCBleGlzdHMgaXQncyBgZmFsc2VgLlxuICogKi9cblJhZGlvLnByb3RvdHlwZS5pc1N1YnNjcmliZWQgPSBmdW5jdGlvbiggY2hhbm5lbCwgbGlzdGVuZXIgKXtcbiAgcmV0dXJuIHRoaXMuY2hhbm5lbEV4aXN0cyhjaGFubmVsKSAmJiB0aGlzLmNoYW5uZWwoY2hhbm5lbCkuaXNTdWJzY3JpYmVkKGxpc3RlbmVyKVxufVxuLyoqXG4gKiBTZW5kIGFyZ3VtZW50cyBvbiBhIGNoYW5uZWwuXG4gKiBJZiB0aGUgY2hhbm5lbCBkb2Vzbid0IGV4aXN0cyBub3RoaW5nIGhhcHBlbnMuXG4gKiAqL1xuUmFkaW8ucHJvdG90eXBlLnB1Ymxpc2ggPSBSYWRpby5wcm90b3R5cGUuYnJvYWRjYXN0ID0gZnVuY3Rpb24oIGNoYW5uZWwgKXtcbiAgaWYoIHRoaXMuY2hhbm5lbEV4aXN0cyhjaGFubmVsKSApe1xuICAgIGNoYW5uZWwgPSB0aGlzLmNoYW5uZWwoY2hhbm5lbClcbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgIHJldHVybiBjaGFubmVsLmJyb2FkY2FzdC5hcHBseShjaGFubmVsLCBhcmdzKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuLyoqXG4gKiBTdWJzY3JpYmUgdG8gYSBjaGFubmVsIHdpdGggYSBsaXN0ZW5lci5cbiAqIEl0IGFsc28gY3JlYXRlcyB0aGUgY2hhbm5lbCBpZiBpdCBkb2Vzbid0IGV4aXN0cyB5ZXQuXG4gKiAqL1xuUmFkaW8ucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uKCBjaGFubmVsLCBsaXN0ZW5lciApe1xuICB0aGlzLmNoYW5uZWwoY2hhbm5lbCkuc3Vic2NyaWJlKGxpc3RlbmVyKVxuICByZXR1cm4gdGhpc1xufVxuLyoqXG4gKiBVbnN1YnNjcmliZSBhIGxpc3RlbmVyIGZyb20gYSBjaGFubmVsLlxuICogSWYgdGhlIGNoYW5uZWwgZG9lc24ndCBleGlzdHMgbm90aGluZyBoYXBwZW5zLlxuICogKi9cblJhZGlvLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKCBjaGFubmVsLCBsaXN0ZW5lciApe1xuICBpZiggdGhpcy5jaGFubmVsRXhpc3RzKGNoYW5uZWwpICkge1xuICAgIHRoaXMuY2hhbm5lbChjaGFubmVsKS51bnN1YnNjcmliZShsaXN0ZW5lcilcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuLyoqXG4gKiBTdWJzY3JpYmUgYSBsaXN0ZW5lciB0byBhIGNoYW5uZWxcbiAqIHRoYXQgdW5zdWJzY3JpYmVzIGFmdGVyIHRoZSBmaXJzdCBicm9hZGNhc3QgaXQgcmVjZWl2ZXMuXG4gKiBJdCBhbHNvIGNyZWF0ZXMgdGhlIGNoYW5uZWwgaWYgaXQgZG9lc24ndCBleGlzdHMgeWV0LlxuICogKi9cblJhZGlvLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oIGNoYW5uZWwsIGxpc3RlbmVyICl7XG4gIHRoaXMuY2hhbm5lbChjaGFubmVsKS5wZWVrKGxpc3RlbmVyKVxuICByZXR1cm4gdGhpc1xufVxuLyoqXG4gKiBFbXB0eSBhIGNoYW5uZWwgcmVtb3ZpbmcgZXZlcnkgc3Vic2NyaWJlciBpdCBob2xkcyxcbiAqIGJ1dCBub3QgZGVsZXRpbmcgdGhlIGNoYW5uZWwgaXRzZWxmLlxuICogSWYgdGhlIGNoYW5uZWwgZG9lc24ndCBleGlzdHMgbm90aGluZyBoYXBwZW5zLlxuICogKi9cblJhZGlvLnByb3RvdHlwZS5lbXB0eUNoYW5uZWwgPSBmdW5jdGlvbiggY2hhbm5lbCApe1xuICBpZiggdGhpcy5jaGFubmVsRXhpc3RzKGNoYW5uZWwpICkge1xuICAgIHRoaXMuY2hhbm5lbChjaGFubmVsKS5lbXB0eSgpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cbiIsInZhciBSYWRpbyA9IHJlcXVpcmUoXCIuL1JhZGlvXCIpXG52YXIgQ2hhbm5lbCA9IHJlcXVpcmUoXCIuL0NoYW5uZWxcIilcblxubW9kdWxlLmV4cG9ydHMgPSBSYWRpb1xubW9kdWxlLmV4cG9ydHMuQ2hhbm5lbCA9IENoYW5uZWxcbiIsIm1vZHVsZS5leHBvcnRzID0gRGVzY3JpcHRvclxuXG52YXIgX3dyaXRhYmxlID0gXCJfd3JpdGFibGVcIlxudmFyIF9lbnVtZXJhYmxlID0gXCJfZW51bWVyYWJsZVwiXG52YXIgX2NvbmZpZ3VyYWJsZSA9IFwiX2NvbmZpZ3VyYWJsZVwiXG5cbmZ1bmN0aW9uIERlc2NyaXB0b3IoIHdyaXRhYmxlLCBlbnVtZXJhYmxlLCBjb25maWd1cmFibGUgKXtcbiAgdGhpcy52YWx1ZSh0aGlzLCBfd3JpdGFibGUsIHdyaXRhYmxlIHx8IGZhbHNlKVxuICB0aGlzLnZhbHVlKHRoaXMsIF9lbnVtZXJhYmxlLCBlbnVtZXJhYmxlIHx8IGZhbHNlKVxuICB0aGlzLnZhbHVlKHRoaXMsIF9jb25maWd1cmFibGUsIGNvbmZpZ3VyYWJsZSB8fCBmYWxzZSlcblxuICB0aGlzLmdldHRlcih0aGlzLCBcIndcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy53cml0YWJsZSB9KVxuICB0aGlzLmdldHRlcih0aGlzLCBcIndyaXRhYmxlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IERlc2NyaXB0b3IodHJ1ZSwgZW51bWVyYWJsZSwgY29uZmlndXJhYmxlKVxuICB9KVxuXG4gIHRoaXMuZ2V0dGVyKHRoaXMsIFwiZVwiLCBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmVudW1lcmFibGUgfSlcbiAgdGhpcy5nZXR0ZXIodGhpcywgXCJlbnVtZXJhYmxlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IERlc2NyaXB0b3Iod3JpdGFibGUsIHRydWUsIGNvbmZpZ3VyYWJsZSlcbiAgfSlcblxuICB0aGlzLmdldHRlcih0aGlzLCBcImNcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5jb25maWd1cmFibGUgfSlcbiAgdGhpcy5nZXR0ZXIodGhpcywgXCJjb25maWd1cmFibGVcIiwgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBuZXcgRGVzY3JpcHRvcih3cml0YWJsZSwgZW51bWVyYWJsZSwgdHJ1ZSlcbiAgfSlcbn1cblxuRGVzY3JpcHRvci5wcm90b3R5cGUgPSB7XG4gIGFjY2Vzc29yOiBmdW5jdGlvbiggb2JqLCBuYW1lLCBnZXR0ZXIsIHNldHRlciApe1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgIGVudW1lcmFibGU6IHRoaXNbX2VudW1lcmFibGVdLFxuICAgICAgY29uZmlndXJhYmxlOiB0aGlzW19jb25maWd1cmFibGVdLFxuICAgICAgZ2V0OiBnZXR0ZXIsXG4gICAgICBzZXQ6IHNldHRlclxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgZ2V0dGVyOiBmdW5jdGlvbiggb2JqLCBuYW1lLCBmbiApe1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgIGVudW1lcmFibGU6IHRoaXNbX2VudW1lcmFibGVdLFxuICAgICAgY29uZmlndXJhYmxlOiB0aGlzW19jb25maWd1cmFibGVdLFxuICAgICAgZ2V0OiBmblxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgc2V0dGVyOiBmdW5jdGlvbiggb2JqLCBuYW1lLCBmbiApe1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgIGVudW1lcmFibGU6IHRoaXNbX2VudW1lcmFibGVdLFxuICAgICAgY29uZmlndXJhYmxlOiB0aGlzW19jb25maWd1cmFibGVdLFxuICAgICAgc2V0OiBmblxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgdmFsdWU6IGZ1bmN0aW9uKCBvYmosIG5hbWUsIHZhbHVlICl7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgICAgd3JpdGFibGU6IHRoaXNbX3dyaXRhYmxlXSxcbiAgICAgIGVudW1lcmFibGU6IHRoaXNbX2VudW1lcmFibGVdLFxuICAgICAgY29uZmlndXJhYmxlOiB0aGlzW19jb25maWd1cmFibGVdLFxuICAgICAgdmFsdWU6IHZhbHVlXG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9LFxuICBtZXRob2Q6IGZ1bmN0aW9uKCBvYmosIG5hbWUsIGZuICl7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgICAgd3JpdGFibGU6IHRoaXNbX3dyaXRhYmxlXSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgY29uZmlndXJhYmxlOiB0aGlzW19jb25maWd1cmFibGVdLFxuICAgICAgdmFsdWU6IGZuXG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9LFxuICBwcm9wZXJ0eTogZnVuY3Rpb24oIG9iaiwgbmFtZSwgdmFsdWUgKXtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICB3cml0YWJsZTogdGhpc1tfd3JpdGFibGVdLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICBjb25maWd1cmFibGU6IHRoaXNbX2NvbmZpZ3VyYWJsZV0sXG4gICAgICB2YWx1ZTogdmFsdWVcbiAgICB9KVxuICAgIHJldHVybiB0aGlzXG4gIH0sXG4gIGNvbnN0YW50OiBmdW5jdGlvbiggb2JqLCBuYW1lLCB2YWx1ZSApe1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuIiwidmFyIGV4dGVuZCA9IHJlcXVpcmUoXCIuL2V4dGVuZFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIGV4dGVuZCh7fSwgb2JqKVxufVxuIiwidmFyIGNvcHkgPSByZXF1aXJlKFwiLi9jb3B5XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmYXVsdHMgKG9wdGlvbnMsIGRlZmF1bHRzKSB7XG4gIGlmICghb3B0aW9ucykge1xuICAgIHJldHVybiBjb3B5KGRlZmF1bHRzKVxuICB9XG5cbiAgdmFyIG9iaiA9IGNvcHkob3B0aW9ucylcblxuICBmb3IgKHZhciBwcm9wIGluIGRlZmF1bHRzKSB7XG4gICAgaWYgKGRlZmF1bHRzLmhhc093blByb3BlcnR5KHByb3ApICYmICFvcHRpb25zLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICBvYmpbcHJvcF0gPSBkZWZhdWx0c1twcm9wXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmpcbn1cbiIsInZhciBEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vRGVzY3JpcHRvclwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBEZXNjcmlwdG9yKClcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKCBvYmosIGV4dGVuc2lvbiApe1xuICBmb3IoIHZhciBuYW1lIGluIGV4dGVuc2lvbiApe1xuICAgIGlmKCBleHRlbnNpb24uaGFzT3duUHJvcGVydHkobmFtZSkgKSBvYmpbbmFtZV0gPSBleHRlbnNpb25bbmFtZV1cbiAgfVxuICByZXR1cm4gb2JqXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBvYmosIGNhbGxiYWNrICl7XG4gIGZvciggdmFyIHByb3AgaW4gb2JqICl7XG4gICAgaWYoIG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSApe1xuICAgICAgY2FsbGJhY2socHJvcCwgb2JqW3Byb3BdLCBvYmopXG4gICAgfVxuICB9XG4gIHJldHVybiBvYmpcbn1cbiIsInZhciBleHRlbmQgPSByZXF1aXJlKFwiLi9leHRlbmRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggb2JqLCBleHRlbnNpb24gKXtcbiAgcmV0dXJuIGV4dGVuZChleHRlbmQoe30sIG9iaiksIGV4dGVuc2lvbilcbn1cbiIsInZhciBpbmhlcml0ID0gcmVxdWlyZShcIm1hdGNoYm94LWZhY3RvcnkvaW5oZXJpdFwiKVxudmFyIFNlbGVjdG9yID0gcmVxdWlyZShcIm1hdGNoYm94LWRvbS9TZWxlY3RvclwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IENoaWxkXG5cbkNoaWxkLkRFRkFVTFRfQVRUUklCVVRFID0gXCJkYXRhLXZpZXdcIlxuXG5mdW5jdGlvbiBDaGlsZCAoY2hpbGQpIHtcbiAgY2hpbGQgPSBjaGlsZCB8fCB7fVxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ2hpbGQpKSB7XG4gICAgcmV0dXJuIG5ldyBDaGlsZChjaGlsZClcbiAgfVxuXG4gIHN3aXRjaCAodHlwZW9mIGNoaWxkKSB7XG4gICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICBTZWxlY3Rvci5jYWxsKHRoaXMsIHtDb25zdHJ1Y3RvcjogY2hpbGR9KVxuICAgICAgYnJlYWtcbiAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICBTZWxlY3Rvci5jYWxsKHRoaXMsIHt2YWx1ZTogY2hpbGR9KVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgU2VsZWN0b3IuY2FsbCh0aGlzLCBjaGlsZClcbiAgfVxuXG4gIHRoaXMuYXR0cmlidXRlID0gdGhpcy5hdHRyaWJ1dGUgfHwgQ2hpbGQuREVGQVVMVF9BVFRSSUJVVEVcbiAgdGhpcy5hdXRvc2VsZWN0ID0gY2hpbGQuYXV0b3NlbGVjdCA9PSB1bmRlZmluZWQgPyBmYWxzZSA6IGNoaWxkLmF1dG9zZWxlY3Rcbn1cblxuaW5oZXJpdChDaGlsZCwgU2VsZWN0b3IpXG5cbkNoaWxkLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMpXG59XG4iLCJ2YXIgZGVsZWdhdGUgPSByZXF1aXJlKFwibWF0Y2hib3gtZG9tL2V2ZW50L2RlbGVnYXRlXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRcblxuZnVuY3Rpb24gRXZlbnQgKGV2ZW50LCB0YXJnZXQsIGNhcHR1cmUsIG9uY2UsIGhhbmRsZXIpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEV2ZW50KSkge1xuICAgIHJldHVybiBuZXcgRXZlbnQoZXZlbnQsIHRhcmdldCwgY2FwdHVyZSwgb25jZSwgaGFuZGxlcilcbiAgfVxuXG4gIGlmICh0eXBlb2YgZXZlbnQgPT0gXCJzdHJpbmdcIikge1xuICAgIHRoaXMudHlwZSA9IGV2ZW50XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIHRoaXMuaGFuZGxlciA9IHRhcmdldFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAzOlxuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldFxuICAgICAgICB0aGlzLmhhbmRsZXIgPSBjYXB0dXJlXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIDQ6XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0XG4gICAgICAgIHRoaXMuY2FwdHVyZSA9IGNhcHR1cmVcbiAgICAgICAgdGhpcy5oYW5kbGVyID0gb25jZVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSA1OlxuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldFxuICAgICAgICB0aGlzLmNhcHR1cmUgPSBjYXB0dXJlXG4gICAgICAgIHRoaXMub25jZSA9IG9uY2VcbiAgICAgICAgdGhpcy5oYW5kbGVyID0gaGFuZGxlclxuICAgICAgICBicmVha1xuICAgIH1cbiAgICB0aGlzLnRyYW5zZm9ybSA9IG51bGxcbiAgfVxuICBlbHNlIHtcbiAgICBldmVudCA9IGV2ZW50IHx8IHt9XG4gICAgdGhpcy50eXBlID0gZXZlbnQudHlwZVxuICAgIHRoaXMudGFyZ2V0ID0gZXZlbnQudGFyZ2V0XG4gICAgdGhpcy5vbmNlID0gISFldmVudC5vbmNlXG4gICAgdGhpcy5jYXB0dXJlID0gISFldmVudC5jYXB0dXJlXG4gICAgdGhpcy5oYW5kbGVyID0gZXZlbnQuaGFuZGxlclxuICAgIGlmIChldmVudC50cmFuc2Zvcm0gKSB0aGlzLnRyYW5zZm9ybSA9IGV2ZW50LnRyYW5zZm9ybVxuICB9XG4gIHRoaXMucHJveHkgPSB0aGlzLmhhbmRsZXJcbn1cblxuRXZlbnQucHJvdG90eXBlLnRyYW5zZm9ybSA9IGZ1bmN0aW9uICgpIHt9XG5cbkV2ZW50LnByb3RvdHlwZS5yZWdpc3RlciA9IGZ1bmN0aW9uIChlbGVtZW50LCBjb250ZXh0KSB7XG4gIGlmICh0aGlzLnRhcmdldCkge1xuICAgIHRoaXMucHJveHkgPSBkZWxlZ2F0ZSh7XG4gICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgZXZlbnQ6IHRoaXMudHlwZSxcbiAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICB0cmFuc2Zvcm06IHRoaXMudHJhbnNmb3JtXG4gICAgfSlcbiAgICB0aGlzLnByb3h5Lm1hdGNoKHRoaXMudGFyZ2V0LCB0aGlzLmhhbmRsZXIpXG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKHRoaXMub25jZSkge1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy5oYW5kbGVyLCB0aGlzLmNhcHR1cmUpXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy5oYW5kbGVyLCB0aGlzLmNhcHR1cmUpXG4gICAgfVxuICB9XG59XG5cbkV2ZW50LnByb3RvdHlwZS51blJlZ2lzdGVyID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgaWYgKHRoaXMucHJveHkpIHtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy50eXBlLCB0aGlzLnByb3h5LCB0aGlzLmNhcHR1cmUpXG4gIH1cbiAgZWxzZSB7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy5oYW5kbGVyLCB0aGlzLmNhcHR1cmUpXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gTW9kaWZpZXJcblxuZnVuY3Rpb24gTW9kaWZpZXIgKG1vZGlmaWVyKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBNb2RpZmllcikpIHtcbiAgICByZXR1cm4gbmV3IE1vZGlmaWVyKG1vZGlmaWVyKVxuICB9XG5cbiAgdGhpcy50eXBlID0gbW9kaWZpZXIudHlwZVxuICB0aGlzLmRlZmF1bHQgPSBtb2RpZmllci5kZWZhdWx0ID09IG51bGwgPyBudWxsIDogbW9kaWZpZXIuZGVmYXVsdFxuICB0aGlzLnZhbHVlcyA9IFtdXG4gIHRoaXMudmFsdWUgPSBudWxsXG4gIHRoaXMub25jaGFuZ2UgPSBudWxsXG4gIHRoaXMuYW5pbWF0aW9uRHVyYXRpb24gPSBtb2RpZmllci5hbmltYXRpb25EdXJhdGlvbiB8fCAwXG4gIHRoaXMudGltZXJJZCA9IG51bGxcbiAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICBjYXNlIFwic3dpdGNoXCI6XG4gICAgICB0aGlzLnZhbHVlcy5wdXNoKG1vZGlmaWVyLm9uICYmIHR5cGVvZiBtb2RpZmllci5vbiA9PSBcInN0cmluZ1wiID8gbW9kaWZpZXIub24gOiBudWxsKVxuICAgICAgdGhpcy52YWx1ZXMucHVzaChtb2RpZmllci5vZmYgJiYgdHlwZW9mIG1vZGlmaWVyLm9mZiA9PSBcInN0cmluZ1wiID8gbW9kaWZpZXIub2ZmIDogbnVsbClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSBcImVudW1cIjpcbiAgICAgIHRoaXMudmFsdWVzID0gbW9kaWZpZXIudmFsdWVzIHx8IFtdXG4gICAgICBicmVha1xuICB9XG59XG5cbk1vZGlmaWVyLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIChlbGVtZW50LCBjb250ZXh0KSB7XG4gIGlmICh0aGlzLmRlZmF1bHQgIT0gbnVsbCkge1xuICAgIHRoaXMuc2V0KHRoaXMuZGVmYXVsdCwgZWxlbWVudCwgY29udGV4dClcbiAgfVxufVxuXG5Nb2RpZmllci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy52YWx1ZVxufVxuXG5Nb2RpZmllci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHZhbHVlLCBlbGVtZW50LCBjb250ZXh0KSB7XG4gIGNvbnRleHQgPSBjb250ZXh0IHx8IGVsZW1lbnRcblxuICB2YXIgcHJldmlvdXNWYWx1ZSA9IHRoaXMudmFsdWVcbiAgdmFyIHByZXZpb3VzQ2xhc3NOYW1lID0gcHJldmlvdXNWYWx1ZVxuICB2YXIgbmV3VmFsdWUgPSB2YWx1ZVxuICB2YXIgbmV3Q2xhc3NOYW1lID0gdmFsdWVcblxuICBpZiAodGhpcy50eXBlID09IFwic3dpdGNoXCIpIHtcbiAgICBuZXdWYWx1ZSA9ICEhdmFsdWVcblxuICAgIHZhciBvbiA9IHRoaXMudmFsdWVzWzBdXG4gICAgdmFyIG9mZiA9IHRoaXMudmFsdWVzWzFdXG5cbiAgICBwcmV2aW91c0NsYXNzTmFtZSA9IHByZXZpb3VzVmFsdWUgPT0gbnVsbFxuICAgICAgICA/IG51bGxcbiAgICAgICAgOiBwcmV2aW91c1ZhbHVlID8gb24gOiBvZmZcbiAgICBuZXdDbGFzc05hbWUgPSBuZXdWYWx1ZSA/IG9uIDogb2ZmXG4gIH1cblxuICBpZiAocHJldmlvdXNWYWx1ZSA9PT0gbmV3VmFsdWUgfHwgIX50aGlzLnZhbHVlcy5pbmRleE9mKG5ld0NsYXNzTmFtZSkpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgfVxuICBpZiAocHJldmlvdXNDbGFzc05hbWUgJiYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMocHJldmlvdXNDbGFzc05hbWUpKSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHByZXZpb3VzQ2xhc3NOYW1lKVxuICB9XG4gIHRoaXMudmFsdWUgPSBuZXdWYWx1ZVxuICBlbGVtZW50LmNsYXNzTGlzdC5hZGQobmV3Q2xhc3NOYW1lKVxuXG4gIHJldHVybiBjYWxsT25DaGFuZ2UodGhpcywgY29udGV4dCwgcHJldmlvdXNWYWx1ZSwgbmV3VmFsdWUpXG59XG5cbk1vZGlmaWVyLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoZWxlbWVudCwgY29udGV4dCkge1xuICBjb250ZXh0ID0gY29udGV4dCB8fCBlbGVtZW50XG4gIGlmICh0aGlzLnZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgfVxuICBpZiAodGhpcy50aW1lcklkKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXJJZClcbiAgICB0aGlzLnRpbWVySWQgPSBudWxsXG4gIH1cblxuICB2YXIgcHJldmlvdXNWYWx1ZSA9IHRoaXMudmFsdWVcbiAgdmFyIHByZXZpb3VzQ2xhc3NOYW1lID0gcHJldmlvdXNWYWx1ZVxuXG4gIGlmICh0aGlzLnR5cGUgPT0gXCJzd2l0Y2hcIikge1xuICAgIHZhciBvbiA9IHRoaXMudmFsdWVzWzBdXG4gICAgdmFyIG9mZiA9IHRoaXMudmFsdWVzWzFdXG5cbiAgICBwcmV2aW91c0NsYXNzTmFtZSA9IHByZXZpb3VzVmFsdWUgPT0gbnVsbFxuICAgICAgICA/IG51bGxcbiAgICAgICAgOiBwcmV2aW91c1ZhbHVlID8gb24gOiBvZmZcbiAgfVxuXG4gIGlmIChwcmV2aW91c0NsYXNzTmFtZSAmJiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhwcmV2aW91c0NsYXNzTmFtZSkpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUocHJldmlvdXNDbGFzc05hbWUpXG4gIH1cbiAgdGhpcy52YWx1ZSA9IG51bGxcblxuICByZXR1cm4gY2FsbE9uQ2hhbmdlKHRoaXMsIGNvbnRleHQsIHByZXZpb3VzVmFsdWUsIG51bGwpXG59XG5cbmZ1bmN0aW9uIGNhbGxPbkNoYW5nZSAobW9kaWZpZXIsIGNvbnRleHQsIHByZXZpb3VzVmFsdWUsIG5ld1ZhbHVlKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgIGlmIChtb2RpZmllci5hbmltYXRpb25EdXJhdGlvbikge1xuICAgICAgaWYgKG1vZGlmaWVyLnRpbWVySWQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KG1vZGlmaWVyLnRpbWVySWQpXG4gICAgICAgIG1vZGlmaWVyLnRpbWVySWQgPSBudWxsXG4gICAgICB9XG4gICAgICBtb2RpZmllci50aW1lcklkID0gc2V0VGltZW91dChyZXNvbHZlLCBtb2RpZmllci5hbmltYXRpb25EdXJhdGlvbilcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXNvbHZlKClcbiAgICB9XG4gIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgIGlmICh0eXBlb2YgbW9kaWZpZXIub25jaGFuZ2UgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICByZXR1cm4gbW9kaWZpZXIub25jaGFuZ2UuY2FsbChjb250ZXh0LCBwcmV2aW91c1ZhbHVlLCBuZXdWYWx1ZSlcbiAgICB9XG4gIH0pXG59XG4iLCJ2YXIgZGVmaW5lID0gcmVxdWlyZShcIm1hdGNoYm94LXV0aWwvb2JqZWN0L2RlZmluZVwiKVxudmFyIGRlZmF1bHRzID0gcmVxdWlyZShcIm1hdGNoYm94LXV0aWwvb2JqZWN0L2RlZmF1bHRzXCIpXG52YXIgZm9ySW4gPSByZXF1aXJlKFwibWF0Y2hib3gtdXRpbC9vYmplY3QvaW5cIilcbnZhciBmYWN0b3J5ID0gcmVxdWlyZShcIm1hdGNoYm94LWZhY3RvcnlcIilcbnZhciBJbnN0YW5jZUV4dGVuc2lvbiA9IHJlcXVpcmUoXCJtYXRjaGJveC1mYWN0b3J5L0luc3RhbmNlRXh0ZW5zaW9uXCIpXG52YXIgQ2FjaGVFeHRlbnNpb24gPSByZXF1aXJlKFwibWF0Y2hib3gtZmFjdG9yeS9DYWNoZUV4dGVuc2lvblwiKVxudmFyIERvbURhdGEgPSByZXF1aXJlKFwibWF0Y2hib3gtZG9tL0RhdGFcIilcbnZhciBkb21EYXRhID0gcmVxdWlyZShcIm1hdGNoYm94LWRvbS9kYXRhXCIpXG52YXIgU2VsZWN0b3IgPSByZXF1aXJlKFwibWF0Y2hib3gtZG9tL1NlbGVjdG9yXCIpXG52YXIgUmFkaW8gPSByZXF1aXJlKFwibWF0Y2hib3gtcmFkaW9cIilcbnZhciBGcmFnbWVudCA9IHJlcXVpcmUoXCJtYXRjaGJveC1kb20vRnJhZ21lbnRcIilcbnZhciBFdmVudCA9IHJlcXVpcmUoXCIuL0V2ZW50XCIpXG52YXIgTW9kaWZpZXIgPSByZXF1aXJlKFwiLi9Nb2RpZmllclwiKVxudmFyIENoaWxkID0gcmVxdWlyZShcIi4vQ2hpbGRcIilcblxudmFyIFZpZXcgPSBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkoe1xuICBpbmNsdWRlOiBbUmFkaW9dLFxuXG4gIGV4dGVuc2lvbnM6IHtcbiAgICBsYXlvdXRzOiBuZXcgQ2FjaGVFeHRlbnNpb24oKSxcbiAgICBldmVudHM6IG5ldyBJbnN0YW5jZUV4dGVuc2lvbihmdW5jdGlvbiAodmlldywgbmFtZSwgZXZlbnQpIHtcbiAgICAgIGlmICghKGV2ZW50IGluc3RhbmNlb2YgRXZlbnQpKSB7XG4gICAgICAgIGV2ZW50ID0gbmV3IEV2ZW50KGV2ZW50KVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBldmVudC5oYW5kbGVyID09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHZpZXdbZXZlbnQuaGFuZGxlcl0gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGV2ZW50LmhhbmRsZXIgPSB2aWV3W2V2ZW50LmhhbmRsZXJdLmJpbmQodmlldylcbiAgICAgIH1cbiAgICAgIHZpZXcuX2V2ZW50c1tuYW1lXSA9IGV2ZW50XG4gICAgfSksXG4gICAgZGF0YXNldDogbmV3IENhY2hlRXh0ZW5zaW9uKGZ1bmN0aW9uIChwcm90b3R5cGUsIG5hbWUsIGRhdGEpIHtcbiAgICAgIGlmICghKGRhdGEgaW5zdGFuY2VvZiBEb21EYXRhKSkge1xuICAgICAgICBkYXRhID0gZG9tRGF0YS5jcmVhdGUobmFtZSwgZGF0YSlcbiAgICAgIH1cbiAgICAgIGRhdGEubmFtZSA9IGRhdGEubmFtZSB8fCBuYW1lXG5cbiAgICAgIHJldHVybiBkYXRhXG4gICAgfSksXG4gICAgbW9kaWZpZXJzOiBuZXcgSW5zdGFuY2VFeHRlbnNpb24oZnVuY3Rpb24gKHZpZXcsIG5hbWUsIG1vZGlmaWVyKSB7XG4gICAgICBpZiAoIShtb2RpZmllciBpbnN0YW5jZW9mIE1vZGlmaWVyKSkge1xuICAgICAgICBtb2RpZmllciA9IG5ldyBNb2RpZmllcihtb2RpZmllcilcbiAgICAgIH1cbiAgICAgIHZpZXcuX21vZGlmaWVyc1tuYW1lXSA9IG1vZGlmaWVyXG4gICAgfSksXG4gICAgY2hpbGRyZW46IG5ldyBDYWNoZUV4dGVuc2lvbihmdW5jdGlvbihwcm90b3R5cGUsIG5hbWUsIGNoaWxkKXtcbiAgICAgIGlmICghKGNoaWxkIGluc3RhbmNlb2YgU2VsZWN0b3IpKSB7XG4gICAgICAgIGNoaWxkID0gbmV3IENoaWxkKGNoaWxkKVxuICAgICAgfVxuXG4gICAgICBpZiAocHJvdG90eXBlLnZpZXdOYW1lKSB7XG4gICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIENoaWxkKSB7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkLmNvbnRhaW5zKGNoaWxkLnZhbHVlIHx8IG5hbWUpLnByZWZpeChwcm90b3R5cGUudmlld05hbWUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGlsZC5jb250YWlucyhjaGlsZC52YWx1ZSB8fCBuYW1lKVxuICAgIH0pLFxuICAgIGZyYWdtZW50czogbmV3IENhY2hlRXh0ZW5zaW9uKGZ1bmN0aW9uIChwcm90b3R5cGUsIG5hbWUsIGZyYWdtZW50KSB7XG4gICAgICBpZiAoIShmcmFnbWVudCBpbnN0YW5jZW9mIEZyYWdtZW50KSkge1xuICAgICAgICByZXR1cm4gbmV3IEZyYWdtZW50KGZyYWdtZW50KVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZyYWdtZW50XG4gICAgfSlcbiAgfSxcblxuICBsYXlvdXRzOiB7fSxcbiAgZXZlbnRzOiB7fSxcbiAgZGF0YXNldDoge30sXG4gIG1vZGlmaWVyczoge30sXG4gIGZyYWdtZW50czoge30sXG4gIGNoaWxkcmVuOiB7fSxcblxuICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gVmlldyggZWxlbWVudCApe1xuICAgIFJhZGlvLmNhbGwodGhpcylcbiAgICBkZWZpbmUudmFsdWUodGhpcywgXCJfZXZlbnRzXCIsIHt9KVxuICAgIGRlZmluZS52YWx1ZSh0aGlzLCBcIl9tb2RpZmllcnNcIiwge30pXG4gICAgZGVmaW5lLndyaXRhYmxlLnZhbHVlKHRoaXMsIFwiX2VsZW1lbnRcIiwgbnVsbClcbiAgICBkZWZpbmUud3JpdGFibGUudmFsdWUodGhpcywgXCJjdXJyZW50TGF5b3V0XCIsIFwiXCIpXG4gICAgVmlldy5pbml0aWFsaXplKHRoaXMpXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFxuICB9LFxuXG4gIGFjY2Vzc29yOiB7XG4gICAgZWxlbWVudDoge1xuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICB2YXIgcHJldmlvdXMgPSB0aGlzLl9lbGVtZW50XG4gICAgICAgIGlmIChwcmV2aW91cyA9PSBlbGVtZW50KSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnRcbiAgICAgICAgdGhpcy5vbkVsZW1lbnRDaGFuZ2UoZWxlbWVudCwgcHJldmlvdXMpXG4gICAgICB9XG4gICAgfSxcbiAgICBlbGVtZW50U2VsZWN0b3I6IHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy52aWV3TmFtZSkge1xuICAgICAgICAgIHJldHVybiBuZXcgQ2hpbGQodGhpcy52aWV3TmFtZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBwcm90b3R5cGU6IHtcbiAgICB2aWV3TmFtZTogXCJcIixcbiAgICBvbkVsZW1lbnRDaGFuZ2U6IGZ1bmN0aW9uIChlbGVtZW50LCBwcmV2aW91cykge1xuICAgICAgdmFyIHZpZXcgPSB0aGlzXG4gICAgICBmb3JJbih0aGlzLl9ldmVudHMsIGZ1bmN0aW9uIChuYW1lLCBldmVudCkge1xuICAgICAgICBpZiAocHJldmlvdXMpIGV2ZW50LnVuUmVnaXN0ZXIocHJldmlvdXMpXG4gICAgICAgIGlmIChlbGVtZW50KSBldmVudC5yZWdpc3RlcihlbGVtZW50LCB2aWV3KVxuICAgICAgfSlcbiAgICAgIGZvckluKHRoaXMuX21vZGlmaWVycywgZnVuY3Rpb24gKG5hbWUsIG1vZGlmaWVyKSB7XG4gICAgICAgIG1vZGlmaWVyLnJlc2V0KGVsZW1lbnQsIHZpZXcpXG4gICAgICB9KVxuICAgICAgZm9ySW4odGhpcy5kYXRhc2V0LCBmdW5jdGlvbiAobmFtZSwgZGF0YSkge1xuICAgICAgICBpZiAoIWRhdGEuaGFzKGVsZW1lbnQpICYmIGRhdGEuZGVmYXVsdCAhPSBudWxsKSB7XG4gICAgICAgICAgZGF0YS5zZXQoZWxlbWVudCwgZGF0YS5kZWZhdWx0KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgZm9ySW4odGhpcy5jaGlsZHJlbiwgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgdmFyIGNoaWxkID0gdmlldy5jaGlsZHJlbltuYW1lXVxuICAgICAgICBpZiAoY2hpbGQgJiYgY2hpbGQuYXV0b3NlbGVjdCkge1xuICAgICAgICAgIHZpZXdbbmFtZV0gPSB2aWV3LmZpbmRDaGlsZChuYW1lKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG4gICAgb25MYXlvdXRDaGFuZ2U6IGZ1bmN0aW9uIChsYXlvdXQsIHByZXZpb3VzKSB7fSxcbiAgICBjaGFuZ2VMYXlvdXQ6IGZ1bmN0aW9uKCBsYXlvdXQgKXtcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRMYXlvdXQgPT0gbGF5b3V0KSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgfVxuXG4gICAgICB2YXIgbGF5b3V0SGFuZGxlciA9IHRoaXMubGF5b3V0c1tsYXlvdXRdXG4gICAgICBpZiAodHlwZW9mIGxheW91dEhhbmRsZXIgIT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJJbnZhbGlkIGxheW91dCBoYW5kbGVyOiBcIiArIGxheW91dCkpXG4gICAgICB9XG5cbiAgICAgIHZhciB2aWV3ID0gdGhpc1xuICAgICAgdmFyIHByZXZpb3VzID0gdmlldy5jdXJyZW50TGF5b3V0XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHByZXZpb3VzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGxheW91dEhhbmRsZXIuY2FsbCh2aWV3LCBwcmV2aW91cylcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICB2aWV3LmN1cnJlbnRMYXlvdXQgPSBsYXlvdXRcbiAgICAgICAgdmlldy5vbkxheW91dENoYW5nZShwcmV2aW91cywgbGF5b3V0KVxuICAgICAgfSlcbiAgICB9LFxuICAgIGRpc3BhdGNoOiBmdW5jdGlvbiAodHlwZSwgZGV0YWlsLCBkZWYpIHtcbiAgICAgIHZhciBkZWZpbml0aW9uID0gZGVmYXVsdHMoZGVmLCB7XG4gICAgICAgIGRldGFpbDogZGV0YWlsIHx8IG51bGwsXG4gICAgICAgIHZpZXc6IHdpbmRvdyxcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgfSlcbiAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgd2luZG93LkN1c3RvbUV2ZW50KHR5cGUsIGRlZmluaXRpb24pKVxuICAgIH0sXG4gICAgZ2V0RGF0YTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhc2V0W25hbWVdXG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gZGF0YS5nZXQodGhpcy5lbGVtZW50KVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9LFxuICAgIHNldERhdGE6IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSwgc2lsZW50KSB7XG4gICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YXNldFtuYW1lXVxuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRhdGEuc2V0KHRoaXMuZWxlbWVudCwgdmFsdWUsIHNpbGVudClcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlbW92ZURhdGE6IGZ1bmN0aW9uIChuYW1lLCBzaWxlbnQpIHtcbiAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhc2V0W25hbWVdXG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICBkYXRhLnJlbW92ZSh0aGlzLmVsZW1lbnQsIHNpbGVudClcbiAgICAgIH1cbiAgICB9LFxuICAgIGhhc0RhdGE6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YXNldFtuYW1lXVxuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRhdGEuaGFzKHRoaXMuZWxlbWVudClcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0sXG4gICAgc2V0TW9kaWZpZXI6IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICAgICAgaWYgKHRoaXMuX21vZGlmaWVyc1tuYW1lXSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kaWZpZXJzW25hbWVdLnNldCh2YWx1ZSwgdGhpcy5lbGVtZW50LCB0aGlzKVxuICAgICAgfVxuICAgIH0sXG4gICAgZ2V0TW9kaWZpZXI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICBpZiAodGhpcy5fbW9kaWZpZXJzW25hbWVdKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2RpZmllcnNbbmFtZV0uZ2V0KClcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlbW92ZU1vZGlmaWVyOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgaWYgKHRoaXMuX21vZGlmaWVyc1tuYW1lXSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kaWZpZXJzW25hbWVdLnJlbW92ZSh0aGlzLmVsZW1lbnQsIHRoaXMpXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXR1cEVsZW1lbnQ6IGZ1bmN0aW9uIChyb290KSB7XG4gICAgICByb290ID0gcm9vdCB8fCBkb2N1bWVudC5ib2R5XG4gICAgICBpZiAocm9vdCAmJiB0aGlzLmVsZW1lbnRTZWxlY3Rvcikge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLmVsZW1lbnRTZWxlY3Rvci5mcm9tKHJvb3QpLmZpbmQoKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG4gICAgZmluZENoaWxkOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgdmFyIGNoaWxkID0gdGhpcy5jaGlsZHJlbltuYW1lXVxuICAgICAgaWYgKGNoaWxkKSB7XG4gICAgICAgIHJldHVybiBjaGlsZC5mcm9tKHRoaXMuZWxlbWVudCwgdGhpcy5lbGVtZW50U2VsZWN0b3IpLmZpbmQoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cbn0pXG4iXX0=
