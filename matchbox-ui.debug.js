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

},{"./view/ActionInit":35,"./view/Child":36,"./view/EnumModifier":37,"./view/EventInit":39,"./view/ModifierInit":41,"./view/SwitchModifier":42,"./view/View":43,"matchbox-dom/data":10}],2:[function(require,module,exports){
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


},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{"../Data":2,"matchbox-factory/inherit":12}],6:[function(require,module,exports){
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

},{"../Data":2,"matchbox-factory/inherit":12}],7:[function(require,module,exports){
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

},{"../Data":2,"matchbox-factory/inherit":12}],8:[function(require,module,exports){
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

},{"../Data":2,"matchbox-factory/inherit":12}],9:[function(require,module,exports){
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

},{"../Data":2,"matchbox-factory/inherit":12}],10:[function(require,module,exports){
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

},{"./BooleanData":5,"./FloatData":6,"./JSONData":7,"./NumberData":8,"./StringData":9}],11:[function(require,module,exports){
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

},{"../Selector":4}],12:[function(require,module,exports){
module.exports = function inherit (Class, Base) {
  Class.prototype = Object.create(Base.prototype)
  Class.prototype.constructor = Class

  return Class
}

},{}],13:[function(require,module,exports){
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

},{"./Extension":15,"matchbox-util/object/in":32,"matchbox-util/object/merge":33}],14:[function(require,module,exports){
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

},{"./Extension":15,"./inherit":23}],15:[function(require,module,exports){
module.exports = Extension

function Extension(extension){
  extension = extension || {}
  this.name = ""
  this.type = extension.type || "instance"
  this.inherit = extension.inherit || false
  this.initialize = extension.initialize || null
}

},{}],16:[function(require,module,exports){
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

},{"./Blueprint":13,"./augment":19,"./extend":20,"./include":21,"./inherit":23,"matchbox-util/object/define":30,"matchbox-util/object/extend":31}],17:[function(require,module,exports){
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

},{"./Extension":15,"./inherit":23}],18:[function(require,module,exports){
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

},{"./Extension":15,"./inherit":23}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
module.exports = function extend (Class, prototype) {
  Object.getOwnPropertyNames(prototype).forEach(function (name) {
    if (name !== "constructor" ) {
      var descriptor = Object.getOwnPropertyDescriptor(prototype, name)
      Object.defineProperty(Class.prototype, name, descriptor)
    }
  })

  return Class
}

},{}],21:[function(require,module,exports){
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

},{"./extend":20}],22:[function(require,module,exports){
var Factory = require("./Factory")

module.exports = factory

factory.CacheExtension = require("./CacheExtension")
factory.InstanceExtension = require("./InstanceExtension")
factory.PrototypeExtension = require("./PrototypeExtension")

function factory( blueprint ){
  return new Factory(blueprint).assemble()
}

},{"./CacheExtension":14,"./Factory":16,"./InstanceExtension":17,"./PrototypeExtension":18}],23:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{"./Channel":24}],26:[function(require,module,exports){
var Radio = require("./Radio")
var Channel = require("./Channel")

module.exports = Radio
module.exports.Channel = Channel

},{"./Channel":24,"./Radio":25}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
var extend = require("./extend")

module.exports = function (obj) {
  return extend({}, obj)
}

},{"./extend":31}],29:[function(require,module,exports){
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

},{"./copy":28}],30:[function(require,module,exports){
var Descriptor = require("./Descriptor")

module.exports = new Descriptor()

},{"./Descriptor":27}],31:[function(require,module,exports){
module.exports = function extend( obj, extension ){
  for( var name in extension ){
    if( extension.hasOwnProperty(name) ) obj[name] = extension[name]
  }
  return obj
}

},{}],32:[function(require,module,exports){
module.exports = function( obj, callback ){
  for( var prop in obj ){
    if( obj.hasOwnProperty(prop) ){
      callback(prop, obj[prop], obj)
    }
  }
  return obj
}

},{}],33:[function(require,module,exports){
var extend = require("./extend")

module.exports = function( obj, extension ){
  return extend(extend({}, obj), extension)
}

},{"./extend":31}],34:[function(require,module,exports){
var inherit = require("matchbox-factory/inherit")
var include = require("matchbox-factory/include")
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

},{"./Child":36,"./Event":38,"matchbox-dom/Selector":4,"matchbox-factory/include":21,"matchbox-factory/inherit":23}],35:[function(require,module,exports){
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

},{"matchbox-dom/Selector":4,"matchbox-factory/inherit":23}],37:[function(require,module,exports){
var inherit = require("matchbox-factory/inherit")
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

},{"./ModifierInit":41,"matchbox-factory/inherit":23}],38:[function(require,module,exports){
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

},{"./Child":36,"matchbox-dom/Selector":4,"matchbox-dom/event/delegate":11}],39:[function(require,module,exports){
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
var inherit = require("matchbox-factory/inherit")
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

},{"./ModifierInit":41,"matchbox-factory/inherit":23}],43:[function(require,module,exports){
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

},{"./Action":34,"./ActionInit":35,"./Child":36,"./Event":38,"./EventInit":39,"./Modifier":40,"./ModifierInit":41,"matchbox-dom/Data":2,"matchbox-dom/Fragment":3,"matchbox-dom/Selector":4,"matchbox-dom/data":10,"matchbox-factory":22,"matchbox-factory/CacheExtension":14,"matchbox-factory/InstanceExtension":17,"matchbox-radio":26,"matchbox-util/object/defaults":29,"matchbox-util/object/define":30,"matchbox-util/object/in":32}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1kb20vRGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1kb20vRnJhZ21lbnQuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZG9tL1NlbGVjdG9yLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWRvbS9kYXRhL0Jvb2xlYW5EYXRhLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWRvbS9kYXRhL0Zsb2F0RGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1kb20vZGF0YS9KU09ORGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1kb20vZGF0YS9OdW1iZXJEYXRhLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWRvbS9kYXRhL1N0cmluZ0RhdGEuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZG9tL2RhdGEvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZG9tL2V2ZW50L2RlbGVnYXRlLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWRvbS9ub2RlX21vZHVsZXMvbWF0Y2hib3gtZmFjdG9yeS9pbmhlcml0LmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWZhY3RvcnkvQmx1ZXByaW50LmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWZhY3RvcnkvQ2FjaGVFeHRlbnNpb24uanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZmFjdG9yeS9FeHRlbnNpb24uanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZmFjdG9yeS9GYWN0b3J5LmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWZhY3RvcnkvSW5zdGFuY2VFeHRlbnNpb24uanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZmFjdG9yeS9Qcm90b3R5cGVFeHRlbnNpb24uanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtZmFjdG9yeS9hdWdtZW50LmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWZhY3RvcnkvZXh0ZW5kLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LWZhY3RvcnkvaW5jbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC1mYWN0b3J5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LXJhZGlvL0NoYW5uZWwuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtcmFkaW8vUmFkaW8uanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtcmFkaW8vaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtdXRpbC9vYmplY3QvRGVzY3JpcHRvci5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC11dGlsL29iamVjdC9jb3B5LmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LXV0aWwvb2JqZWN0L2RlZmF1bHRzLmpzIiwibm9kZV9tb2R1bGVzL21hdGNoYm94LXV0aWwvb2JqZWN0L2RlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9tYXRjaGJveC11dGlsL29iamVjdC9leHRlbmQuanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtdXRpbC9vYmplY3QvaW4uanMiLCJub2RlX21vZHVsZXMvbWF0Y2hib3gtdXRpbC9vYmplY3QvbWVyZ2UuanMiLCJ2aWV3L0FjdGlvbi5qcyIsInZpZXcvQWN0aW9uSW5pdC5qcyIsInZpZXcvQ2hpbGQuanMiLCJ2aWV3L0VudW1Nb2RpZmllci5qcyIsInZpZXcvRXZlbnQuanMiLCJ2aWV3L0V2ZW50SW5pdC5qcyIsInZpZXcvTW9kaWZpZXIuanMiLCJ2aWV3L01vZGlmaWVySW5pdC5qcyIsInZpZXcvU3dpdGNoTW9kaWZpZXIuanMiLCJ2aWV3L1ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHVpID0gbW9kdWxlLmV4cG9ydHMgPSB7fVxuXG51aS5kYXRhID0gcmVxdWlyZShcIm1hdGNoYm94LWRvbS9kYXRhXCIpXG51aS5WaWV3ID0gcmVxdWlyZShcIi4vdmlldy9WaWV3XCIpXG51aS5DaGlsZCA9IHJlcXVpcmUoXCIuL3ZpZXcvQ2hpbGRcIilcbnVpLkV2ZW50ID0gcmVxdWlyZShcIi4vdmlldy9FdmVudEluaXRcIilcbnVpLkFjdGlvbiA9IHJlcXVpcmUoXCIuL3ZpZXcvQWN0aW9uSW5pdFwiKVxudWkuTW9kaWZpZXIgPSByZXF1aXJlKFwiLi92aWV3L01vZGlmaWVySW5pdFwiKVxudWkuU3dpdGNoTW9kaWZpZXIgPSByZXF1aXJlKFwiLi92aWV3L1N3aXRjaE1vZGlmaWVyXCIpXG51aS5FbnVtTW9kaWZpZXIgPSByZXF1aXJlKFwiLi92aWV3L0VudW1Nb2RpZmllclwiKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBEb21EYXRhXG5cbmZ1bmN0aW9uIERvbURhdGEgKG5hbWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpIHtcbiAgdGhpcy5uYW1lID0gbmFtZVxuICB0aGlzLm9uQ2hhbmdlID0gb25DaGFuZ2UgfHwgbnVsbFxuICB0aGlzLmRlZmF1bHQgPSBkZWZhdWx0VmFsdWUgPT0gbnVsbCA/IG51bGwgOiBkZWZhdWx0VmFsdWVcbn1cblxuRG9tRGF0YS5wcm90b3R5cGUudHlwZSA9IFwiXCJcblxuRG9tRGF0YS5wcm90b3R5cGUuYXR0cmlidXRlTmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIFwiZGF0YS1cIit0aGlzLm5hbWVcbn1cbkRvbURhdGEucHJvdG90eXBlLmNoZWNrVHlwZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbFxufVxuXG5Eb21EYXRhLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWVcbn1cblxuRG9tRGF0YS5wcm90b3R5cGUuc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiBcIlwiK3ZhbHVlXG59XG5cbkRvbURhdGEucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHZhciBhdHRyaWJ1dGVOYW1lID0gdGhpcy5hdHRyaWJ1dGVOYW1lKClcbiAgaWYgKGVsZW1lbnQuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2UoZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSkpXG4gIH1cblxuICByZXR1cm4gdGhpcy5kZWZhdWx0XG59XG5cbkRvbURhdGEucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZSwgY29udGV4dCwgc2lsZW50KSB7XG4gIGlmICghdGhpcy5jaGVja1R5cGUodmFsdWUpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbid0IHNldCBEb21EYXRhIFwiK3RoaXMudHlwZStcIiB0byAnXCIrdmFsdWUrXCInXCIpXG4gIH1cblxuICB2YXIgYXR0cmlidXRlTmFtZSA9IHRoaXMuYXR0cmlidXRlTmFtZSgpXG5cbiAgdmFyIGhhc1ZhbHVlID0gZWxlbWVudC5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSlcbiAgdmFyIG5ld1N0cmluZ1ZhbHVlID0gdGhpcy5zdHJpbmdpZnkodmFsdWUpXG4gIHZhciBwcmV2U3RyaW5nVmFsdWUgPSBoYXNWYWx1ZSA/IGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpIDogbnVsbFxuXG4gIGlmIChuZXdTdHJpbmdWYWx1ZSA9PT0gcHJldlN0cmluZ1ZhbHVlKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBuZXdTdHJpbmdWYWx1ZSlcblxuICBpZiAoIXNpbGVudCkge1xuICAgIHZhciBvbkNoYW5nZSA9IHRoaXMub25DaGFuZ2VcbiAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgIHZhciBwcmV2aW91c1ZhbHVlID0gaGFzVmFsdWUgPyB0aGlzLnBhcnNlKHByZXZTdHJpbmdWYWx1ZSkgOiBudWxsXG4gICAgICBvbkNoYW5nZS5jYWxsKGNvbnRleHQsIHByZXZpb3VzVmFsdWUsIHZhbHVlKVxuICAgIH1cbiAgfVxufVxuXG5Eb21EYXRhLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICByZXR1cm4gZWxlbWVudC5oYXNBdHRyaWJ1dGUodGhpcy5hdHRyaWJ1dGVOYW1lKCkpXG59XG5cbkRvbURhdGEucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBjb250ZXh0LCBzaWxlbnQpIHtcbiAgdmFyIGF0dHJpYnV0ZU5hbWUgPSB0aGlzLmF0dHJpYnV0ZU5hbWUoKVxuICBpZiAoIWVsZW1lbnQuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgcHJldmlvdXNWYWx1ZSA9IGVsZW1lbnQuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpXG4gICAgICA/IHRoaXMucGFyc2UoZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSkpXG4gICAgICA6IG51bGxcblxuICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKVxuXG4gIGlmICghc2lsZW50KSB7XG4gICAgdmFyIG9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZVxuICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgb25DaGFuZ2UuY2FsbChjb250ZXh0LCBwcmV2aW91c1ZhbHVlLCBudWxsKVxuICAgIH1cbiAgfVxufVxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IEZyYWdtZW50XG5cbmZ1bmN0aW9uIEZyYWdtZW50IChmcmFnbWVudCkge1xuICBmcmFnbWVudCA9IGZyYWdtZW50IHx8IHt9XG4gIHRoaXMuaHRtbCA9IGZyYWdtZW50Lmh0bWwgfHwgXCJcIlxuICB0aGlzLmZpcnN0ID0gZnJhZ21lbnQuZmlyc3QgPT0gdW5kZWZpbmVkIHx8ICEhZnJhZ21lbnQuZmlyc3RcbiAgdGhpcy50aW1lb3V0ID0gZnJhZ21lbnQudGltZW91dCB8fCAyMDAwXG59XG5cbkZyYWdtZW50LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbiAoaHRtbCkge1xuICB2YXIgdGVtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cbiAgdGVtcC5pbm5lckhUTUwgPSBodG1sIHx8IHRoaXMuaHRtbFxuXG4gIGlmICh0aGlzLmZpcnN0ID09PSB1bmRlZmluZWQgfHwgdGhpcy5maXJzdCkge1xuICAgIHJldHVybiB0ZW1wLmNoaWxkcmVuWzBdXG4gIH1cblxuICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcbiAgd2hpbGUgKHRlbXAuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZCh0ZW1wLmZpcnN0Q2hpbGQpXG4gIH1cblxuICByZXR1cm4gZnJhZ21lbnQ7XG59XG5cbkZyYWdtZW50LnByb3RvdHlwZS5jb21waWxlID0gZnVuY3Rpb24gKGh0bWwsIG9wdGlvbnMsIGNiKSB7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIGNiKG51bGwsIGh0bWwpXG4gIH0sIDQpXG59XG5cbkZyYWdtZW50LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgZnJhZ21lbnQgPSB0aGlzXG4gIGNvbnRleHQgPSBjb250ZXh0IHx8IHt9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVzb2x2ZWQgPSBmYWxzZVxuICAgIHZhciBpZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlJlbmRlciB0aW1lZCBvdXRcIikpXG4gICAgfSwgZnJhZ21lbnQudGltZW91dClcblxuICAgIHRyeSB7XG4gICAgICBmcmFnbWVudC5jb21waWxlKGNvbnRleHQsIG9wdGlvbnMsIGZ1bmN0aW9uIChlcnIsIHJlbmRlcmVkKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChpZClcbiAgICAgICAgaWYgKHJlc29sdmVkKSByZXR1cm5cblxuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmVqZWN0KGVycilcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKGZyYWdtZW50LmNyZWF0ZShyZW5kZXJlZCkpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICByZWplY3QoZSlcbiAgICB9XG4gIH0pXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFNlbGVjdG9yXG5cblNlbGVjdG9yLkRFRkFVTFRfTkVTVF9TRVBBUkFUT1IgPSBcIjpcIlxuXG5mdW5jdGlvbiBTZWxlY3RvciAoc2VsZWN0b3IpIHtcbiAgc2VsZWN0b3IgPSBzZWxlY3RvciB8fCB7fVxuICB0aGlzLmF0dHJpYnV0ZSA9IHNlbGVjdG9yLmF0dHJpYnV0ZSB8fCBcIlwiXG4gIHRoaXMudmFsdWUgPSBzZWxlY3Rvci52YWx1ZSB8fCBudWxsXG4gIHRoaXMub3BlcmF0b3IgPSBzZWxlY3Rvci5vcGVyYXRvciB8fCBcIj1cIlxuICB0aGlzLmV4dHJhID0gc2VsZWN0b3IuZXh0cmEgfHwgXCJcIlxuXG4gIHRoaXMuZWxlbWVudCA9IHNlbGVjdG9yLmVsZW1lbnQgfHwgbnVsbFxuICB0aGlzLnVud2FudGVkUGFyZW50U2VsZWN0b3IgPSBzZWxlY3Rvci51bndhbnRlZFBhcmVudFNlbGVjdG9yIHx8IG51bGxcblxuICB0aGlzLkNvbnN0cnVjdG9yID0gc2VsZWN0b3IuQ29uc3RydWN0b3IgfHwgbnVsbFxuICB0aGlzLmluc3RhbnRpYXRlID0gc2VsZWN0b3IuaW5zdGFudGlhdGUgfHwgbnVsbFxuICB0aGlzLm11bHRpcGxlID0gc2VsZWN0b3IubXVsdGlwbGUgIT0gbnVsbCA/ICEhc2VsZWN0b3IubXVsdGlwbGUgOiBmYWxzZVxuXG4gIHRoaXMubWF0Y2hlciA9IHNlbGVjdG9yLm1hdGNoZXIgfHwgbnVsbFxufVxuXG5mdW5jdGlvbiBwYXJlbnRGaWx0ZXIgKHVuTWF0Y2hTZWxlY3RvciwgcmVhbFBhcmVudCkge1xuICByZXR1cm4gZnVuY3Rpb24gaXNVbndhbnRlZENoaWxkKGVsKSB7XG4gICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudE5vZGVcbiAgICB3aGlsZSAocGFyZW50ICYmIHBhcmVudCAhPSByZWFsUGFyZW50KSB7XG4gICAgICBpZiAocGFyZW50Lm1hdGNoZXModW5NYXRjaFNlbGVjdG9yKSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cblxuU2VsZWN0b3IucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdG9yKHRoaXMpXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5jb21iaW5lID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIHZhciBzID0gdGhpcy5jbG9uZSgpXG4gIHMuZXh0cmEgKz0gc2VsZWN0b3IudG9TdHJpbmcoKVxuICByZXR1cm4gc1xufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUuZXF1YWwgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIHMgPSB0aGlzLmNsb25lKClcbiAgcy5vcGVyYXRvciA9IFwiPVwiXG4gIHMudmFsdWUgPSB2YWx1ZVxuICByZXR1cm4gc1xufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIHMgPSB0aGlzLmNsb25lKClcbiAgcy5vcGVyYXRvciA9IFwifj1cIlxuICBzLnZhbHVlID0gdmFsdWVcbiAgcmV0dXJuIHNcbn1cblxuU2VsZWN0b3IucHJvdG90eXBlLnByZWZpeCA9IGZ1bmN0aW9uIChwcmUsIHNlcGFyYXRvcikge1xuICB2YXIgcyA9IHRoaXMuY2xvbmUoKVxuICB2YXIgc2VwID0gcy52YWx1ZSA/IHNlcGFyYXRvciB8fCBTZWxlY3Rvci5ERUZBVUxUX05FU1RfU0VQQVJBVE9SIDogXCJcIlxuICBzLnZhbHVlID0gcHJlICsgc2VwICsgcy52YWx1ZVxuICByZXR1cm4gc1xufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUubmVzdCA9IGZ1bmN0aW9uIChwb3N0LCBzZXBhcmF0b3IpIHtcbiAgdmFyIHMgPSB0aGlzLmNsb25lKClcbiAgdmFyIHNlcCA9IHMudmFsdWUgPyBzZXBhcmF0b3IgfHwgU2VsZWN0b3IuREVGQVVMVF9ORVNUX1NFUEFSQVRPUiA6IFwiXCJcbiAgcy52YWx1ZSArPSBzZXAgKyBwb3N0XG4gIHJldHVybiBzXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5mcm9tID0gZnVuY3Rpb24gKGVsZW1lbnQsIGV4Y2VwdCkge1xuICB2YXIgcyA9IHRoaXMuY2xvbmUoKVxuICBzLmVsZW1lbnQgPSBlbGVtZW50XG4gIGlmIChleGNlcHQpIHtcbiAgICBzLnVud2FudGVkUGFyZW50U2VsZWN0b3IgPSBleGNlcHQudG9TdHJpbmcoKVxuICB9XG4gIHJldHVybiBzXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5zZWxlY3QgPSBmdW5jdGlvbiAoZWxlbWVudCwgdHJhbnNmb3JtKSB7XG4gIHZhciByZXN1bHQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy50b1N0cmluZygpKVxuICBpZiAocmVzdWx0ICYmIHRoaXMudW53YW50ZWRQYXJlbnRTZWxlY3RvciAmJiB0aGlzLmVsZW1lbnQpIHtcbiAgICB2YXIgaXNXYW50ZWRDaGlsZCA9IHBhcmVudEZpbHRlcih0aGlzLnVud2FudGVkUGFyZW50U2VsZWN0b3IsIHRoaXMuZWxlbWVudClcbiAgICBpZiAoIWlzV2FudGVkQ2hpbGQocmVzdWx0KSkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxuICAgICAgPyB0cmFuc2Zvcm0gPyB0cmFuc2Zvcm0ocmVzdWx0KSA6IHJlc3VsdFxuICAgICAgOiBudWxsXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5zZWxlY3RBbGwgPSBmdW5jdGlvbiAoZWxlbWVudCwgdHJhbnNmb3JtKSB7XG4gIHZhciByZXN1bHQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy50b1N0cmluZygpKVxuICBpZiAodGhpcy51bndhbnRlZFBhcmVudFNlbGVjdG9yICYmIHRoaXMuZWxlbWVudCkge1xuICAgIHJlc3VsdCA9IFtdLmZpbHRlci5jYWxsKHJlc3VsdCwgcGFyZW50RmlsdGVyKHRoaXMudW53YW50ZWRQYXJlbnRTZWxlY3RvciwgdGhpcy5lbGVtZW50KSlcbiAgfVxuICByZXR1cm4gdHJhbnNmb3JtID8gW10ubWFwLmNhbGwocmVzdWx0LCB0cmFuc2Zvcm0pIDogW10uc2xpY2UuY2FsbChyZXN1bHQpXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5ub2RlID0gZnVuY3Rpb24gKHRyYW5zZm9ybSkge1xuICByZXR1cm4gdGhpcy5zZWxlY3QodGhpcy5lbGVtZW50LCB0cmFuc2Zvcm0pXG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5ub2RlTGlzdCA9IGZ1bmN0aW9uICh0cmFuc2Zvcm0pIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0QWxsKHRoaXMuZWxlbWVudCwgdHJhbnNmb3JtKVxufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUuY29uc3RydWN0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzLkNvbnN0cnVjdG9yXG4gIHZhciBpbnN0YW50aWF0ZSA9IHRoaXMuaW5zdGFudGlhdGUgfHwgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gbmV3IENvbnN0cnVjdG9yKGVsZW1lbnQpXG4gIH1cbiAgaWYgKHRoaXMubXVsdGlwbGUpIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlTGlzdCgpLm1hcChpbnN0YW50aWF0ZSlcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlKGluc3RhbnRpYXRlKVxuICB9XG59XG5cblNlbGVjdG9yLnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5Db25zdHJ1Y3RvciB8fCB0aGlzLmluc3RhbnRpYXRlKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0KClcbiAgfVxuICBpZiAodGhpcy5tdWx0aXBsZSkge1xuICAgIHJldHVybiB0aGlzLm5vZGVMaXN0KClcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlKClcbiAgfVxufVxuXG5TZWxlY3Rvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzdHJpbmcgPSBcIlwiXG4gIHZhciB2YWx1ZSA9IHRoaXMudmFsdWVcbiAgdmFyIGF0dHJpYnV0ZSA9IHRoaXMuYXR0cmlidXRlXG4gIHZhciBleHRyYSA9IHRoaXMuZXh0cmEgfHwgXCJcIlxuXG4gIHN3aXRjaCAoYXR0cmlidXRlKSB7XG4gICAgY2FzZSBcImlkXCI6XG4gICAgICAgIHN0cmluZyA9IFwiI1wiICsgdmFsdWVcbiAgICAgIGJyZWFrXG4gICAgY2FzZSBcImNsYXNzXCI6XG4gICAgICBzdHJpbmcgPSBcIi5cIiArIHZhbHVlXG4gICAgICBicmVha1xuICAgIGNhc2UgXCJcIjpcbiAgICAgIHN0cmluZyA9IHZhbHVlIHx8IFwiXCJcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHZhbHVlID0gdmFsdWUgPT09IFwiXCIgfHwgdmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09IGZhbHNlIHx8IHZhbHVlID09IG51bGxcbiAgICAgICAgPyBcIlwiXG4gICAgICAgIDogJ1wiJyArIHZhbHVlICsgJ1wiJ1xuICAgICAgdmFyIG9wZXJhdG9yID0gdmFsdWUgPyB0aGlzLm9wZXJhdG9yIHx8IFwiPVwiIDogXCJcIlxuICAgICAgc3RyaW5nID0gXCJbXCIgKyBhdHRyaWJ1dGUgKyBvcGVyYXRvciArIHZhbHVlICsgXCJdXCJcbiAgfVxuXG4gIHN0cmluZyArPSBleHRyYVxuXG4gIHJldHVybiBzdHJpbmdcbn1cbiIsInZhciBpbmhlcml0ID0gcmVxdWlyZShcIm1hdGNoYm94LWZhY3RvcnkvaW5oZXJpdFwiKVxudmFyIERhdGEgPSByZXF1aXJlKFwiLi4vRGF0YVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb2xlYW5EYXRhXG5cbmZ1bmN0aW9uIEJvb2xlYW5EYXRhIChuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKSB7XG4gIERhdGEuY2FsbCh0aGlzLCBuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKVxufVxuXG5pbmhlcml0KEJvb2xlYW5EYXRhLCBEYXRhKVxuXG5Cb29sZWFuRGF0YS5wcm90b3R5cGUudHlwZSA9IFwiQm9vbGVhblwiXG5cbkJvb2xlYW5EYXRhLnByb3RvdHlwZS5jaGVja1R5cGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSBcImJvb2xlYW5cIlxufVxuXG5Cb29sZWFuRGF0YS5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBcInRydWVcIlxufVxuXG5Cb29sZWFuRGF0YS5wcm90b3R5cGUuc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiXG59XG4iLCJ2YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCJtYXRjaGJveC1mYWN0b3J5L2luaGVyaXRcIilcbnZhciBEYXRhID0gcmVxdWlyZShcIi4uL0RhdGFcIilcblxubW9kdWxlLmV4cG9ydHMgPSBGbG9hdERhdGFcblxuZnVuY3Rpb24gRmxvYXREYXRhIChuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKSB7XG4gIERhdGEuY2FsbCh0aGlzLCBuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKVxufVxuXG5pbmhlcml0KEZsb2F0RGF0YSwgRGF0YSlcblxuRmxvYXREYXRhLnByb3RvdHlwZS50eXBlID0gXCJmbG9hdFwiXG5cbkZsb2F0RGF0YS5wcm90b3R5cGUuY2hlY2tUeXBlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gXCJudW1iZXJcIlxufVxuXG5GbG9hdERhdGEucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKVxufVxuXG5GbG9hdERhdGEucHJvdG90eXBlLnN0cmluZ2lmeSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gXCJcIit2YWx1ZVxufVxuIiwidmFyIGluaGVyaXQgPSByZXF1aXJlKFwibWF0Y2hib3gtZmFjdG9yeS9pbmhlcml0XCIpXG52YXIgRGF0YSA9IHJlcXVpcmUoXCIuLi9EYXRhXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gSlNPTkRhdGFcblxuZnVuY3Rpb24gSlNPTkRhdGEgKG5hbWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpIHtcbiAgRGF0YS5jYWxsKHRoaXMsIG5hbWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpXG59XG5cbmluaGVyaXQoSlNPTkRhdGEsIERhdGEpXG5cbkpTT05EYXRhLnByb3RvdHlwZS50eXBlID0gXCJqc29uXCJcblxuSlNPTkRhdGEucHJvdG90eXBlLmNoZWNrVHlwZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbFxufVxuXG5KU09ORGF0YS5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUpXG59XG5cbkpTT05EYXRhLnByb3RvdHlwZS5zdHJpbmdpZnkgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKVxufVxuIiwidmFyIGluaGVyaXQgPSByZXF1aXJlKFwibWF0Y2hib3gtZmFjdG9yeS9pbmhlcml0XCIpXG52YXIgRGF0YSA9IHJlcXVpcmUoXCIuLi9EYXRhXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gTnVtYmVyRGF0YVxuXG5mdW5jdGlvbiBOdW1iZXJEYXRhIChuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKSB7XG4gIERhdGEuY2FsbCh0aGlzLCBuYW1lLCBkZWZhdWx0VmFsdWUsIG9uQ2hhbmdlKVxufVxuXG5pbmhlcml0KE51bWJlckRhdGEsIERhdGEpXG5cbk51bWJlckRhdGEucHJvdG90eXBlLnR5cGUgPSBcIm51bWJlclwiXG5cbk51bWJlckRhdGEucHJvdG90eXBlLmNoZWNrVHlwZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09IFwibnVtYmVyXCJcbn1cblxuTnVtYmVyRGF0YS5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHBhcnNlSW50KHZhbHVlLCAxMClcbn1cblxuTnVtYmVyRGF0YS5wcm90b3R5cGUuc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiBcIlwiK3ZhbHVlXG59XG4iLCJ2YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCJtYXRjaGJveC1mYWN0b3J5L2luaGVyaXRcIilcbnZhciBEYXRhID0gcmVxdWlyZShcIi4uL0RhdGFcIilcblxubW9kdWxlLmV4cG9ydHMgPSBTdHJpbmdEYXRhXG5cbmZ1bmN0aW9uIFN0cmluZ0RhdGEgKG5hbWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpIHtcbiAgRGF0YS5jYWxsKHRoaXMsIG5hbWUsIGRlZmF1bHRWYWx1ZSwgb25DaGFuZ2UpXG59XG5cbmluaGVyaXQoU3RyaW5nRGF0YSwgRGF0YSlcblxuU3RyaW5nRGF0YS5wcm90b3R5cGUudHlwZSA9IFwic3RyaW5nXCJcblxuU3RyaW5nRGF0YS5wcm90b3R5cGUuY2hlY2tUeXBlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gXCJzdHJpbmdcIlxufVxuXG5TdHJpbmdEYXRhLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPyBcIlwiK3ZhbHVlIDogXCJcIlxufVxuXG5TdHJpbmdEYXRhLnByb3RvdHlwZS5zdHJpbmdpZnkgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID8gXCJcIit2YWx1ZSA6IFwiXCJcbn1cbiIsInZhciBkYXRhID0gbW9kdWxlLmV4cG9ydHMgPSB7fVxuXG5kYXRhLkJvb2xlYW4gPSByZXF1aXJlKFwiLi9Cb29sZWFuRGF0YVwiKVxuZGF0YS5TdHJpbmcgPSByZXF1aXJlKFwiLi9TdHJpbmdEYXRhXCIpXG5kYXRhLk51bWJlciA9IHJlcXVpcmUoXCIuL051bWJlckRhdGFcIilcbmRhdGEuRmxvYXQgPSByZXF1aXJlKFwiLi9GbG9hdERhdGFcIilcbmRhdGEuSlNPTiA9IHJlcXVpcmUoXCIuL0pTT05EYXRhXCIpXG5cbmRhdGEuY3JlYXRlID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlLCBvbkNoYW5nZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZVxuXG4gIHN3aXRjaCh0eXBlKSB7XG4gICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICAgIHJldHVybiBuZXcgZGF0YS5Cb29sZWFuKG5hbWUsIHZhbHVlLCBvbkNoYW5nZSlcbiAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICByZXR1cm4gbmV3IGRhdGEuU3RyaW5nKG5hbWUsIHZhbHVlLCBvbkNoYW5nZSlcbiAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICAvLyBub3RlOiBpdCBmYWlscyBmb3IgMS4wXG4gICAgICBpZiAodmFsdWUgPT09ICt2YWx1ZSAmJiB2YWx1ZSAhPT0gKHZhbHVlIHwgMCkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBkYXRhLkZsb2F0KG5hbWUsIHZhbHVlLCBvbkNoYW5nZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgZGF0YS5OdW1iZXIobmFtZSwgdmFsdWUsIG9uQ2hhbmdlKVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbmV3IGRhdGEuSlNPTihuYW1lLCB2YWx1ZSwgb25DaGFuZ2UpXG4gIH1cbn1cbiIsInZhciBTZWxlY3RvciA9IHJlcXVpcmUoXCIuLi9TZWxlY3RvclwiKVxuXG4vKipcbiAqIFJlZ2lzdGVycyBhbiBldmVudCBsaXN0ZW5lciBvbiBhbiBlbGVtZW50XG4gKiBhbmQgcmV0dXJucyBhIGRlbGVnYXRvci5cbiAqIEEgZGVsZWdhdGVkIGV2ZW50IHJ1bnMgbWF0Y2hlcyB0byBmaW5kIGFuIGV2ZW50IHRhcmdldCxcbiAqIHRoZW4gZXhlY3V0ZXMgdGhlIGhhbmRsZXIgcGFpcmVkIHdpdGggdGhlIG1hdGNoZXIuXG4gKiBNYXRjaGVycyBjYW4gY2hlY2sgaWYgYW4gZXZlbnQgdGFyZ2V0IG1hdGNoZXMgYSBnaXZlbiBzZWxlY3RvcixcbiAqIG9yIHNlZSBpZiBhbiBvZiBpdHMgcGFyZW50cyBkby5cbiAqICovXG5tb2R1bGUuZXhwb3J0cyA9IGRlbGVnYXRlXG5cbmZ1bmN0aW9uIGRlbGVnYXRlKCBvcHRpb25zICl7XG4gIHZhciBlbGVtZW50ID0gb3B0aW9ucy5lbGVtZW50XG4gICAgLCBldmVudCA9IG9wdGlvbnMuZXZlbnRcbiAgICAsIGNhcHR1cmUgPSAhIW9wdGlvbnMuY2FwdHVyZSB8fCBmYWxzZVxuICAgICwgY29udGV4dCA9IG9wdGlvbnMuY29udGV4dCB8fCBlbGVtZW50XG4gICAgLCB0cmFuc2Zvcm0gPSBvcHRpb25zLnRyYW5zZm9ybSB8fCBudWxsXG5cbiAgaWYoICFlbGVtZW50ICl7XG4gICAgY29uc29sZS5sb2coXCJDYW4ndCBkZWxlZ2F0ZSB1bmRlZmluZWQgZWxlbWVudFwiKVxuICAgIHJldHVybiBudWxsXG4gIH1cbiAgaWYoICFldmVudCApe1xuICAgIGNvbnNvbGUubG9nKFwiQ2FuJ3QgZGVsZWdhdGUgdW5kZWZpbmVkIGV2ZW50XCIpXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHZhciBoYW5kbGVyID0gY3JlYXRlSGFuZGxlcihjb250ZXh0LCB0cmFuc2Zvcm0pXG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlciwgY2FwdHVyZSlcblxuICByZXR1cm4gaGFuZGxlclxufVxuXG4vKipcbiAqIFJldHVybnMgYSBkZWxlZ2F0b3IgdGhhdCBjYW4gYmUgdXNlZCBhcyBhbiBldmVudCBsaXN0ZW5lci5cbiAqIFRoZSBkZWxlZ2F0b3IgaGFzIHN0YXRpYyBtZXRob2RzIHdoaWNoIGNhbiBiZSB1c2VkIHRvIHJlZ2lzdGVyIGhhbmRsZXJzLlxuICogKi9cbmZ1bmN0aW9uIGNyZWF0ZUhhbmRsZXIoIGNvbnRleHQsIHRyYW5zZm9ybSApe1xuICB2YXIgbWF0Y2hlcnMgPSBbXVxuXG4gIGZ1bmN0aW9uIGRlbGVnYXRlZEhhbmRsZXIoIGUgKXtcbiAgICB2YXIgbCA9IG1hdGNoZXJzLmxlbmd0aFxuICAgIGlmKCAhbCApe1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICB2YXIgZWwgPSB0aGlzXG4gICAgICAgICwgaSA9IC0xXG4gICAgICAgICwgaGFuZGxlclxuICAgICAgICAsIHNlbGVjdG9yXG4gICAgICAgICwgZGVsZWdhdGVFbGVtZW50XG4gICAgICAgICwgc3RvcFByb3BhZ2F0aW9uXG4gICAgICAgICwgYXJnc1xuXG4gICAgd2hpbGUoICsraSA8IGwgKXtcbiAgICAgIGFyZ3MgPSBtYXRjaGVyc1tpXVxuICAgICAgaGFuZGxlciA9IGFyZ3NbMF1cbiAgICAgIHNlbGVjdG9yID0gYXJnc1sxXVxuXG4gICAgICBkZWxlZ2F0ZUVsZW1lbnQgPSBtYXRjaENhcHR1cmVQYXRoKHNlbGVjdG9yLCBlbCwgZSwgdHJhbnNmb3JtLCBjb250ZXh0KVxuICAgICAgaWYoIGRlbGVnYXRlRWxlbWVudCAmJiBkZWxlZ2F0ZUVsZW1lbnQubGVuZ3RoICkge1xuICAgICAgICBzdG9wUHJvcGFnYXRpb24gPSBmYWxzZSA9PT0gaGFuZGxlci5hcHBseShjb250ZXh0LCBbZV0uY29uY2F0KGRlbGVnYXRlRWxlbWVudCkpXG4gICAgICAgIGlmKCBzdG9wUHJvcGFnYXRpb24gKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGhhbmRsZXIgd2l0aCBhIHRhcmdldCBmaW5kZXIgbG9naWNcbiAgICogKi9cbiAgZGVsZWdhdGVkSGFuZGxlci5tYXRjaCA9IGZ1bmN0aW9uKCBzZWxlY3RvciwgaGFuZGxlciApe1xuICAgIG1hdGNoZXJzLnB1c2goW2hhbmRsZXIsIHNlbGVjdG9yXSlcbiAgICByZXR1cm4gZGVsZWdhdGVkSGFuZGxlclxuICB9XG5cbiAgcmV0dXJuIGRlbGVnYXRlZEhhbmRsZXJcbn1cblxuZnVuY3Rpb24gbWF0Y2hDYXB0dXJlUGF0aCggc2VsZWN0b3IsIGVsLCBlLCB0cmFuc2Zvcm0sIGNvbnRleHQgKXtcbiAgdmFyIGRlbGVnYXRlRWxlbWVudHMgPSBbXVxuICB2YXIgZGVsZWdhdGVFbGVtZW50ID0gbnVsbFxuICBpZiggQXJyYXkuaXNBcnJheShzZWxlY3RvcikgKXtcbiAgICB2YXIgaSA9IC0xXG4gICAgdmFyIGwgPSBzZWxlY3Rvci5sZW5ndGhcbiAgICB3aGlsZSggKytpIDwgbCApe1xuICAgICAgZGVsZWdhdGVFbGVtZW50ID0gZmluZFBhcmVudChzZWxlY3RvcltpXSwgZWwsIGUpXG4gICAgICBpZiggIWRlbGVnYXRlRWxlbWVudCApIHJldHVybiBudWxsXG4gICAgICBpZiAodHlwZW9mIHRyYW5zZm9ybSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgZGVsZWdhdGVFbGVtZW50ID0gdHJhbnNmb3JtKGNvbnRleHQsIHNlbGVjdG9yW2ldLCBkZWxlZ2F0ZUVsZW1lbnQpXG4gICAgICB9XG4gICAgICBkZWxlZ2F0ZUVsZW1lbnRzLnB1c2goZGVsZWdhdGVFbGVtZW50KVxuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBkZWxlZ2F0ZUVsZW1lbnQgPSBmaW5kUGFyZW50KHNlbGVjdG9yLCBlbCwgZSlcbiAgICBpZiggIWRlbGVnYXRlRWxlbWVudCApIHJldHVybiBudWxsXG4gICAgaWYgKHR5cGVvZiB0cmFuc2Zvcm0gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBkZWxlZ2F0ZUVsZW1lbnQgPSB0cmFuc2Zvcm0oY29udGV4dCwgc2VsZWN0b3IsIGRlbGVnYXRlRWxlbWVudClcbiAgICB9XG4gICAgZGVsZWdhdGVFbGVtZW50cy5wdXNoKGRlbGVnYXRlRWxlbWVudClcbiAgfVxuICByZXR1cm4gZGVsZWdhdGVFbGVtZW50c1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSB0YXJnZXQgb3IgYW55IG9mIGl0cyBwYXJlbnQgbWF0Y2hlcyBhIHNlbGVjdG9yXG4gKiAqL1xuZnVuY3Rpb24gZmluZFBhcmVudCggc2VsZWN0b3IsIGVsLCBlICl7XG4gIHZhciB0YXJnZXQgPSBlLnRhcmdldFxuICBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBTZWxlY3Rvcikge1xuICAgIHNlbGVjdG9yID0gc2VsZWN0b3IudG9TdHJpbmcoKVxuICB9XG4gIHN3aXRjaCggdHlwZW9mIHNlbGVjdG9yICl7XG4gICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgd2hpbGUoIHRhcmdldCAmJiB0YXJnZXQgIT0gZWwgKXtcbiAgICAgICAgaWYoIHRhcmdldC5tYXRjaGVzICYmIHRhcmdldC5tYXRjaGVzKHNlbGVjdG9yKSApIHJldHVybiB0YXJnZXRcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGVcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICB3aGlsZSggdGFyZ2V0ICYmIHRhcmdldCAhPSBlbCApe1xuICAgICAgICBpZiggc2VsZWN0b3IuY2FsbChlbCwgdGFyZ2V0KSApIHJldHVybiB0YXJnZXRcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGVcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsXG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdCAoQ2xhc3MsIEJhc2UpIHtcbiAgQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSlcbiAgQ2xhc3MucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ2xhc3NcblxuICByZXR1cm4gQ2xhc3Ncbn1cbiIsInZhciBtZXJnZSA9IHJlcXVpcmUoXCJtYXRjaGJveC11dGlsL29iamVjdC9tZXJnZVwiKVxudmFyIGZvckluID0gcmVxdWlyZShcIm1hdGNoYm94LXV0aWwvb2JqZWN0L2luXCIpXG52YXIgRXh0ZW5zaW9uID0gcmVxdWlyZShcIi4vRXh0ZW5zaW9uXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gQmx1ZXByaW50XG5cbmZ1bmN0aW9uIEJsdWVwcmludCggYmxvY2tzLCBwYXJlbnQgKXtcbiAgdmFyIGJsdWVwcmludCA9IHRoaXNcblxuICB0aGlzLmJsb2NrcyA9IG1lcmdlKGJsb2NrcylcbiAgdGhpcy5wYXJlbnQgPSBwYXJlbnRcblxuICB0aGlzLmxvY2FsRXh0ZW5zaW9ucyA9IHRoaXMuZ2V0KFwiZXh0ZW5zaW9uc1wiLCB7fSlcblxuICBmb3JJbih0aGlzLmxvY2FsRXh0ZW5zaW9ucywgZnVuY3Rpb24oIG5hbWUsIGV4dGVuc2lvbiApe1xuICAgIC8vaWYgKHBhcmVudCAmJiAhIX5wYXJlbnQuZXh0ZW5zaW9uTmFtZXMuaW5kZXhPZihuYW1lKSkge1xuICAgIC8vICB0aHJvdyBuZXcgRXJyb3IoXCJEZXNjcmlwdGlvbiBvdmVycmlkZSBpcyBub3Qgc3VwcG9ydGVkXCIpXG4gICAgLy99XG5cbiAgICBleHRlbnNpb24gPSBleHRlbnNpb24gaW5zdGFuY2VvZiBFeHRlbnNpb25cbiAgICAgICAgPyBleHRlbnNpb25cbiAgICAgICAgOiBuZXcgRXh0ZW5zaW9uKGV4dGVuc2lvbilcbiAgICBibHVlcHJpbnQubG9jYWxFeHRlbnNpb25zW25hbWVdID0gZXh0ZW5zaW9uXG4gICAgZXh0ZW5zaW9uLm5hbWUgPSBuYW1lXG4gIH0pXG5cbiAgdGhpcy5nbG9iYWxFeHRlbnNpb25zID0gdGhpcy5sb2NhbEV4dGVuc2lvbnNcblxuICBpZiAocGFyZW50KSB7XG4gICAgdGhpcy5nbG9iYWxFeHRlbnNpb25zID0gbWVyZ2UocGFyZW50Lmdsb2JhbEV4dGVuc2lvbnMsIHRoaXMubG9jYWxFeHRlbnNpb25zKVxuICAgIGZvckluKHRoaXMuZ2xvYmFsRXh0ZW5zaW9ucywgZnVuY3Rpb24gKG5hbWUsIGV4dGVuc2lvbikge1xuICAgICAgaWYgKGV4dGVuc2lvbi5pbmhlcml0KSB7XG4gICAgICAgIGJsdWVwcmludC5ibG9ja3NbbmFtZV0gPSBtZXJnZShwYXJlbnQuZ2V0KG5hbWUpLCBibHVlcHJpbnQuZ2V0KG5hbWUpKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuQmx1ZXByaW50LnByb3RvdHlwZS5idWlsZFByb3RvdHlwZSA9IGZ1bmN0aW9uKCBwcm90b3R5cGUsIHRvcCApe1xuICB0aGlzLmJ1aWxkKFwicHJvdG90eXBlXCIsIHRoaXMuZ2xvYmFsRXh0ZW5zaW9ucywgdG9wLCBmdW5jdGlvbiAobmFtZSwgZXh0ZW5zaW9uLCBibG9jaykge1xuICAgIGZvckluKGJsb2NrLCBmdW5jdGlvbiggbmFtZSwgdmFsdWUgKXtcbiAgICAgIGV4dGVuc2lvbi5pbml0aWFsaXplKHByb3RvdHlwZSwgbmFtZSwgdmFsdWUpXG4gICAgfSlcbiAgfSlcbn1cblxuQmx1ZXByaW50LnByb3RvdHlwZS5idWlsZENhY2hlID0gZnVuY3Rpb24oIHByb3RvdHlwZSwgdG9wICl7XG4gIHRoaXMuYnVpbGQoXCJjYWNoZVwiLCB0aGlzLmdsb2JhbEV4dGVuc2lvbnMsIHRvcCwgZnVuY3Rpb24gKG5hbWUsIGV4dGVuc2lvbiwgYmxvY2spIHtcbiAgICBpZiAoIXByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgcHJvdG90eXBlW25hbWVdID0ge31cbiAgICB9XG5cbiAgICB2YXIgY2FjaGUgPSBwcm90b3R5cGVbbmFtZV1cbiAgICB2YXIgaW5pdGlhbGl6ZSA9IGV4dGVuc2lvbi5pbml0aWFsaXplXG5cbiAgICBmb3JJbihibG9jaywgZnVuY3Rpb24oIG5hbWUsIHZhbHVlICl7XG4gICAgICBjYWNoZVtuYW1lXSA9IGluaXRpYWxpemVcbiAgICAgICAgICA/IGluaXRpYWxpemUocHJvdG90eXBlLCBuYW1lLCB2YWx1ZSlcbiAgICAgICAgICA6IHZhbHVlXG4gICAgfSlcbiAgfSlcbn1cblxuQmx1ZXByaW50LnByb3RvdHlwZS5idWlsZEluc3RhbmNlID0gZnVuY3Rpb24oIGluc3RhbmNlLCB0b3AgKXtcbiAgdGhpcy5idWlsZChcImluc3RhbmNlXCIsIHRoaXMubG9jYWxFeHRlbnNpb25zLCB0b3AsIGZ1bmN0aW9uIChuYW1lLCBleHRlbnNpb24sIGJsb2NrKSB7XG4gICAgZm9ySW4oYmxvY2ssIGZ1bmN0aW9uKCBuYW1lLCB2YWx1ZSApe1xuICAgICAgZXh0ZW5zaW9uLmluaXRpYWxpemUoaW5zdGFuY2UsIG5hbWUsIHZhbHVlKVxuICAgIH0pXG4gIH0pXG59XG5cbkJsdWVwcmludC5wcm90b3R5cGUuYnVpbGQgPSBmdW5jdGlvbiggdHlwZSwgZXh0ZW5zaW9ucywgdG9wLCBidWlsZCApe1xuICB2YXIgYmx1ZXByaW50ID0gdG9wIHx8IHRoaXNcbiAgLy92YXIgYmFzZSA9IHRoaXNcbiAgZm9ySW4oZXh0ZW5zaW9ucywgZnVuY3Rpb24gKG5hbWUsIGV4dGVuc2lvbikge1xuICAgIGlmKCBleHRlbnNpb24udHlwZSAhPSB0eXBlICkgcmV0dXJuXG4gICAgLy92YXIgYmx1ZXByaW50ID0gZXh0ZW5zaW9uLmluaGVyaXQgPyB0b3AgOiBiYXNlXG4gICAgdmFyIGJsb2NrID0gYmx1ZXByaW50LmdldChuYW1lKVxuICAgIGlmKCAhYmxvY2sgKSByZXR1cm5cblxuICAgIGJ1aWxkKG5hbWUsIGV4dGVuc2lvbiwgYmxvY2spXG4gIH0pXG59XG5cbkJsdWVwcmludC5wcm90b3R5cGUuZGlnZXN0ID0gZnVuY3Rpb24oIG5hbWUsIGZuLCBsb29wICl7XG4gIGlmICh0aGlzLmhhcyhuYW1lKSkge1xuICAgIHZhciBibG9jayA9IHRoaXMuZ2V0KG5hbWUpXG4gICAgaWYgKGxvb3ApIHtcbiAgICAgIGZvckluKGJsb2NrLCBmbilcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBmbi5jYWxsKHRoaXMsIGJsb2NrKVxuICAgIH1cbiAgfVxufVxuXG5CbHVlcHJpbnQucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKCBuYW1lICl7XG4gIHJldHVybiB0aGlzLmJsb2Nrcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSAmJiB0aGlzLmJsb2Nrc1tuYW1lXSAhPSBudWxsXG59XG5cbkJsdWVwcmludC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oIG5hbWUsIGRlZmF1bHRWYWx1ZSApe1xuICBpZiggdGhpcy5oYXMobmFtZSkgKXtcbiAgICByZXR1cm4gdGhpcy5ibG9ja3NbbmFtZV1cbiAgfVxuICBlbHNlIHJldHVybiBkZWZhdWx0VmFsdWVcbn1cbiIsInZhciBpbmhlcml0ID0gcmVxdWlyZShcIi4vaW5oZXJpdFwiKVxudmFyIEV4dGVuc2lvbiA9IHJlcXVpcmUoXCIuL0V4dGVuc2lvblwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhY2hlRXh0ZW5zaW9uXG5cbmZ1bmN0aW9uIENhY2hlRXh0ZW5zaW9uIChpbml0aWFsaXplKSB7XG4gIEV4dGVuc2lvbi5jYWxsKHRoaXMsIHtcbiAgICB0eXBlOiBcImNhY2hlXCIsXG4gICAgaW5oZXJpdDogdHJ1ZSxcbiAgICBpbml0aWFsaXplOiBpbml0aWFsaXplXG4gIH0pXG59XG5cbmluaGVyaXQoQ2FjaGVFeHRlbnNpb24sIEV4dGVuc2lvbilcbiIsIm1vZHVsZS5leHBvcnRzID0gRXh0ZW5zaW9uXG5cbmZ1bmN0aW9uIEV4dGVuc2lvbihleHRlbnNpb24pe1xuICBleHRlbnNpb24gPSBleHRlbnNpb24gfHwge31cbiAgdGhpcy5uYW1lID0gXCJcIlxuICB0aGlzLnR5cGUgPSBleHRlbnNpb24udHlwZSB8fCBcImluc3RhbmNlXCJcbiAgdGhpcy5pbmhlcml0ID0gZXh0ZW5zaW9uLmluaGVyaXQgfHwgZmFsc2VcbiAgdGhpcy5pbml0aWFsaXplID0gZXh0ZW5zaW9uLmluaXRpYWxpemUgfHwgbnVsbFxufVxuIiwidmFyIGRlZmluZSA9IHJlcXVpcmUoXCJtYXRjaGJveC11dGlsL29iamVjdC9kZWZpbmVcIilcbnZhciBleHRlbmRPYmplY3QgPSByZXF1aXJlKFwibWF0Y2hib3gtdXRpbC9vYmplY3QvZXh0ZW5kXCIpXG52YXIgQmx1ZXByaW50ID0gcmVxdWlyZShcIi4vQmx1ZXByaW50XCIpXG52YXIgZXh0ZW5kID0gcmVxdWlyZShcIi4vZXh0ZW5kXCIpXG52YXIgYXVnbWVudCA9IHJlcXVpcmUoXCIuL2F1Z21lbnRcIilcbnZhciBpbmNsdWRlID0gcmVxdWlyZShcIi4vaW5jbHVkZVwiKVxudmFyIGluaGVyaXQgPSByZXF1aXJlKFwiLi9pbmhlcml0XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjdG9yeVxuXG5mdW5jdGlvbiBGYWN0b3J5KCBibHVlcHJpbnQsIHBhcmVudCApe1xuICB2YXIgZmFjdG9yeSA9IHRoaXNcblxuICBpZiggIShibHVlcHJpbnQgaW5zdGFuY2VvZiBCbHVlcHJpbnQpICkge1xuICAgIGJsdWVwcmludCA9IG5ldyBCbHVlcHJpbnQoYmx1ZXByaW50LCBwYXJlbnQgPyBwYXJlbnQuYmx1ZXByaW50IDogbnVsbClcbiAgfVxuXG4gIHRoaXMuYmx1ZXByaW50ID0gYmx1ZXByaW50XG4gIHRoaXMucGFyZW50ID0gcGFyZW50IHx8IG51bGxcbiAgdGhpcy5hbmNlc3RvcnMgPSBwYXJlbnQgPyBwYXJlbnQuYW5jZXN0b3JzLmNvbmNhdChbcGFyZW50XSkgOiBbXVxuICB0aGlzLnJvb3QgPSB0aGlzLmFuY2VzdG9yc1swXSB8fCBudWxsXG4gIHRoaXMuU3VwZXIgPSBibHVlcHJpbnQuZ2V0KFwiaW5oZXJpdFwiLCBudWxsKVxuICB0aGlzLkNvbnN0cnVjdG9yID0gYmx1ZXByaW50LmdldChcImNvbnN0cnVjdG9yXCIsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoZmFjdG9yeS5TdXBlcikge1xuICAgICAgZmFjdG9yeS5TdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgfVxuICAgIHRoaXMuY29uc3RydWN0b3IuaW5pdGlhbGl6ZSh0aGlzKVxuICB9KVxuICB0aGlzLkNvbnN0cnVjdG9yLmV4dGVuZCA9IGZ1bmN0aW9uIChzdXBlckJsdWVwcmludCkge1xuICAgIHN1cGVyQmx1ZXByaW50ID0gc3VwZXJCbHVlcHJpbnQgfHwge31cbiAgICBzdXBlckJsdWVwcmludFtcImluaGVyaXRcIl0gPSBmYWN0b3J5LkNvbnN0cnVjdG9yXG4gICAgdmFyIHN1cGVyRmFjdG9yeSA9IG5ldyBGYWN0b3J5KHN1cGVyQmx1ZXByaW50LCBmYWN0b3J5KVxuICAgIHJldHVybiBzdXBlckZhY3RvcnkuYXNzZW1ibGUoKVxuICB9XG5cbiAgdGhpcy5pbmR1c3RyeS5wdXNoKHRoaXMpXG59XG5cbkZhY3RvcnkucHJvdG90eXBlLmFzc2VtYmxlID0gZnVuY3Rpb24oKXtcbiAgdmFyIGZhY3RvcnkgPSB0aGlzXG4gIHZhciBibHVlcHJpbnQgPSB0aGlzLmJsdWVwcmludFxuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzLkNvbnN0cnVjdG9yXG5cbiAgQ29uc3RydWN0b3IuU3VwZXIgPSB0aGlzLlN1cGVyXG4gIENvbnN0cnVjdG9yLmJsdWVwcmludCA9IGJsdWVwcmludFxuXG4gIHRoaXMuZGlnZXN0KClcblxuICBibHVlcHJpbnQuYnVpbGRQcm90b3R5cGUoQ29uc3RydWN0b3IucHJvdG90eXBlLCBibHVlcHJpbnQpXG4gIGJsdWVwcmludC5idWlsZENhY2hlKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgYmx1ZXByaW50KVxuXG4gIENvbnN0cnVjdG9yLmluaXRpYWxpemUgPSBmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICAvL3ZhciB0b3AgPSBmYWN0b3J5LmZpbmRGYWN0b3J5KGluc3RhbmNlLmNvbnN0cnVjdG9yKS5ibHVlcHJpbnRcbiAgICB2YXIgdG9wID0gaW5zdGFuY2UuY29uc3RydWN0b3IuYmx1ZXByaW50XG4gICAgYmx1ZXByaW50LmJ1aWxkSW5zdGFuY2UoaW5zdGFuY2UsIHRvcClcbiAgfVxuXG4gIHJldHVybiBDb25zdHJ1Y3RvclxufVxuXG5GYWN0b3J5LnByb3RvdHlwZS5kaWdlc3QgPSBmdW5jdGlvbiggICl7XG4gIHZhciBmYWN0b3J5ID0gdGhpc1xuICB2YXIgYmx1ZXByaW50ID0gdGhpcy5ibHVlcHJpbnRcbiAgdmFyIENvbnN0cnVjdG9yID0gdGhpcy5Db25zdHJ1Y3RvclxuICB2YXIgcHJvdG8gPSBDb25zdHJ1Y3Rvci5wcm90b3R5cGVcblxuICBibHVlcHJpbnQuZGlnZXN0KFwiaW5oZXJpdFwiLCBmdW5jdGlvbiAoU3VwZXIpIHtcbiAgICBpbmhlcml0KENvbnN0cnVjdG9yLCBTdXBlcilcbiAgfSlcbiAgYmx1ZXByaW50LmRpZ2VzdChcImluY2x1ZGVcIiwgZnVuY3Rpb24gKGluY2x1ZGVzKSB7XG4gICAgaW5jbHVkZShDb25zdHJ1Y3RvciwgaW5jbHVkZXMpXG4gIH0pXG4gIGJsdWVwcmludC5kaWdlc3QoXCJhdWdtZW50XCIsIGZ1bmN0aW9uIChhdWdtZW50cykge1xuICAgIGF1Z21lbnQoQ29uc3RydWN0b3IsIGF1Z21lbnRzKVxuICB9KVxuICBibHVlcHJpbnQuZGlnZXN0KFwicHJvdG90eXBlXCIsIGZ1bmN0aW9uIChwcm90bykge1xuICAgIGV4dGVuZChDb25zdHJ1Y3RvciwgcHJvdG8pXG4gIH0pXG4gIGlmIChibHVlcHJpbnQucGFyZW50KSB7XG4gICAgZXh0ZW5kT2JqZWN0KENvbnN0cnVjdG9yLCBibHVlcHJpbnQucGFyZW50LmdldChcInN0YXRpY1wiKSlcbiAgfVxuICBibHVlcHJpbnQuZGlnZXN0KFwic3RhdGljXCIsIGZ1bmN0aW9uIChtZXRob2RzKSB7XG4gICAgZXh0ZW5kT2JqZWN0KENvbnN0cnVjdG9yLCBtZXRob2RzKVxuICB9KVxuICBibHVlcHJpbnQuZGlnZXN0KFwiYWNjZXNzb3JcIiwgZnVuY3Rpb24oIG5hbWUsIGFjY2VzcyApe1xuICAgIGlmKCAhYWNjZXNzICkgcmV0dXJuXG4gICAgaWYoIHR5cGVvZiBhY2Nlc3MgPT0gXCJmdW5jdGlvblwiICl7XG4gICAgICBkZWZpbmUuZ2V0dGVyKHByb3RvLCBuYW1lLCBhY2Nlc3MpXG4gICAgfVxuICAgIGVsc2UgaWYoIHR5cGVvZiBhY2Nlc3NbXCJnZXRcIl0gPT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBhY2Nlc3NbXCJzZXRcIl0gPT0gXCJmdW5jdGlvblwiICl7XG4gICAgICBkZWZpbmUuYWNjZXNzb3IocHJvdG8sIG5hbWUsIGFjY2Vzc1tcImdldFwiXSwgYWNjZXNzW1wic2V0XCJdKVxuICAgIH1cbiAgICBlbHNlIGlmKCB0eXBlb2YgYWNjZXNzW1wiZ2V0XCJdID09IFwiZnVuY3Rpb25cIiApe1xuICAgICAgZGVmaW5lLmdldHRlcihwcm90bywgbmFtZSwgYWNjZXNzW1wiZ2V0XCJdKVxuICAgIH1cbiAgICBlbHNlIGlmKCB0eXBlb2YgYWNjZXNzW1wic2V0XCJdID09IFwiZnVuY3Rpb25cIiApe1xuICAgICAgZGVmaW5lLmdldHRlcihwcm90bywgbmFtZSwgYWNjZXNzW1wic2V0XCJdKVxuICAgIH1cbiAgfSwgdHJ1ZSlcbiAgLy9ibHVlcHJpbnQuZGlnZXN0KFwiaW5jbHVkZVwiLCBmdW5jdGlvbiAoaW5jbHVkZXMpIHtcbiAgLy8gIGlmICghQXJyYXkuaXNBcnJheShpbmNsdWRlcykpIHtcbiAgLy8gICAgaW5jbHVkZXMgPSBbaW5jbHVkZXNdXG4gIC8vICB9XG4gIC8vICBpbmNsdWRlcy5mb3JFYWNoKGZ1bmN0aW9uIChpbmNsdWRlKSB7XG4gIC8vICAgIHZhciBmb3JlaWduID0gZmFjdG9yeS5maW5kRmFjdG9yeShpbmNsdWRlKVxuICAvLyAgICBpZiAoZm9yZWlnbikge1xuICAvLyAgICAgIGZvcmVpZ24uYmx1ZXByaW50LmJ1aWxkKFwicHJvdG90eXBlXCIsIENvbnN0cnVjdG9yLnByb3RvdHlwZSwgYmx1ZXByaW50KVxuICAvLyAgICB9XG4gIC8vICB9KVxuICAvL30pXG59XG5cbkZhY3RvcnkucHJvdG90eXBlLmluZHVzdHJ5ID0gW11cblxuRmFjdG9yeS5wcm90b3R5cGUuZmluZEZhY3RvcnkgPSBmdW5jdGlvbiggQ29uc3RydWN0b3IgKXtcbiAgdmFyIHJldCA9IG51bGxcbiAgdGhpcy5pbmR1c3RyeS5zb21lKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgcmV0dXJuIGZhY3RvcnkuQ29uc3RydWN0b3IgPT09IENvbnN0cnVjdG9yICYmIChyZXQgPSBmYWN0b3J5KVxuICB9KVxuICByZXR1cm4gcmV0XG59XG4iLCJ2YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCIuL2luaGVyaXRcIilcbnZhciBFeHRlbnNpb24gPSByZXF1aXJlKFwiLi9FeHRlbnNpb25cIilcblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0YW5jZUV4dGVuc2lvblxuXG5mdW5jdGlvbiBJbnN0YW5jZUV4dGVuc2lvbiAoaW5pdGlhbGl6ZSkge1xuICBFeHRlbnNpb24uY2FsbCh0aGlzLCB7XG4gICAgdHlwZTogXCJpbnN0YW5jZVwiLFxuICAgIGluaGVyaXQ6IHRydWUsXG4gICAgaW5pdGlhbGl6ZTogaW5pdGlhbGl6ZVxuICB9KVxufVxuXG5pbmhlcml0KEluc3RhbmNlRXh0ZW5zaW9uLCBFeHRlbnNpb24pXG4iLCJ2YXIgaW5oZXJpdCA9IHJlcXVpcmUoXCIuL2luaGVyaXRcIilcbnZhciBFeHRlbnNpb24gPSByZXF1aXJlKFwiLi9FeHRlbnNpb25cIilcblxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVFeHRlbnNpb25cblxuZnVuY3Rpb24gUHJvdG90eXBlRXh0ZW5zaW9uIChpbml0aWFsaXplKSB7XG4gIEV4dGVuc2lvbi5jYWxsKHRoaXMsIHtcbiAgICB0eXBlOiBcInByb3RvdHlwZVwiLFxuICAgIGluaGVyaXQ6IGZhbHNlLFxuICAgIGluaXRpYWxpemU6IGluaXRpYWxpemVcbiAgfSlcbn1cblxuaW5oZXJpdChQcm90b3R5cGVFeHRlbnNpb24sIEV4dGVuc2lvbilcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXVnbWVudCAoQ2xhc3MsIG1peGluKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KG1peGluKSkge1xuICAgIG1peGluLmZvckVhY2goZnVuY3Rpb24gKG1peGluKSB7XG4gICAgICBpZiAodHlwZW9mIG1peGluID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBtaXhpbi5jYWxsKENsYXNzLnByb3RvdHlwZSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIGVsc2Uge1xuICAgIGlmICh0eXBlb2YgbWl4aW4gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBtaXhpbi5jYWxsKENsYXNzLnByb3RvdHlwZSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gQ2xhc3Ncbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kIChDbGFzcywgcHJvdG90eXBlKSB7XG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHByb3RvdHlwZSkuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBcImNvbnN0cnVjdG9yXCIgKSB7XG4gICAgICB2YXIgZGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocHJvdG90eXBlLCBuYW1lKVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENsYXNzLnByb3RvdHlwZSwgbmFtZSwgZGVzY3JpcHRvcilcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIENsYXNzXG59XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZShcIi4vZXh0ZW5kXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5jbHVkZSAoQ2xhc3MsIE90aGVyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KE90aGVyKSkge1xuICAgIE90aGVyLmZvckVhY2goZnVuY3Rpb24gKE90aGVyKSB7XG4gICAgICBpZiAodHlwZW9mIE90aGVyID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBleHRlbmQoQ2xhc3MsIE90aGVyLnByb3RvdHlwZSlcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHR5cGVvZiBPdGhlciA9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIGV4dGVuZChDbGFzcywgT3RoZXIpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBlbHNlIHtcbiAgICBpZiAodHlwZW9mIE90aGVyID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgZXh0ZW5kKENsYXNzLCBPdGhlci5wcm90b3R5cGUpXG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBPdGhlciA9PSBcIm9iamVjdFwiKSB7XG4gICAgICBleHRlbmQoQ2xhc3MsIE90aGVyKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBDbGFzc1xufVxuIiwidmFyIEZhY3RvcnkgPSByZXF1aXJlKFwiLi9GYWN0b3J5XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeVxuXG5mYWN0b3J5LkNhY2hlRXh0ZW5zaW9uID0gcmVxdWlyZShcIi4vQ2FjaGVFeHRlbnNpb25cIilcbmZhY3RvcnkuSW5zdGFuY2VFeHRlbnNpb24gPSByZXF1aXJlKFwiLi9JbnN0YW5jZUV4dGVuc2lvblwiKVxuZmFjdG9yeS5Qcm90b3R5cGVFeHRlbnNpb24gPSByZXF1aXJlKFwiLi9Qcm90b3R5cGVFeHRlbnNpb25cIilcblxuZnVuY3Rpb24gZmFjdG9yeSggYmx1ZXByaW50ICl7XG4gIHJldHVybiBuZXcgRmFjdG9yeShibHVlcHJpbnQpLmFzc2VtYmxlKClcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gQ2hhbm5lbFxuXG5mdW5jdGlvbiBDaGFubmVsKCBuYW1lICl7XG4gIHRoaXMubmFtZSA9IG5hbWUgfHwgXCJcIlxufVxuXG5DaGFubmVsLnByb3RvdHlwZSA9IFtdXG5DaGFubmVsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENoYW5uZWxcblxuQ2hhbm5lbC5wcm90b3R5cGUucHVibGlzaCA9IENoYW5uZWwucHJvdG90eXBlLmJyb2FkY2FzdCA9IGZ1bmN0aW9uKCAgKXtcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuc2xpY2UoKVxuICB2YXIgbCA9IGxpc3RlbmVycy5sZW5ndGhcbiAgaWYoICFsICl7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICB2YXIgZXJyID0gbnVsbFxuICB2YXIgaSA9IC0xXG4gIHZhciBsaXN0ZW5lclxuXG4gIHdoaWxlKCArK2kgPCBsICl7XG4gICAgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV1cbiAgICBpZiggbGlzdGVuZXIucHJveHkgKSBsaXN0ZW5lciA9IGxpc3RlbmVyLnByb3h5XG4gICAgZXJyID0gbGlzdGVuZXIuYXBwbHkobnVsbCwgYXJndW1lbnRzKVxuICAgIGlmKCBlcnIgIT0gbnVsbCApIHJldHVybiBlcnJcbiAgfVxuXG4gIHJldHVybiBmYWxzZVxufVxuQ2hhbm5lbC5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24oIGxpc3RlbmVyICl7XG4gIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT0gXCJmdW5jdGlvblwiICl7XG4gICAgY29uc29sZS53YXJuKFwiTGlzdGVuZXIgaXMgbm90IGEgZnVuY3Rpb25cIiwgbGlzdGVuZXIpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGlmKCAhdGhpcy5pc1N1YnNjcmliZWQobGlzdGVuZXIpICkge1xuICAgIHRoaXMucHVzaChsaXN0ZW5lcilcbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5DaGFubmVsLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKCBsaXN0ZW5lciApe1xuICB2YXIgaSA9IHRoaXMuaW5kZXhPZihsaXN0ZW5lcilcbiAgaWYoIH5pICkgdGhpcy5zcGxpY2UoaSwgMSlcbiAgcmV0dXJuIHRoaXNcbn1cbkNoYW5uZWwucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbiggbGlzdGVuZXIgKXtcbiAgdmFyIGNoYW5uZWwgPSB0aGlzXG5cbiAgLy8gcGlnZ3liYWNrIG9uIHRoZSBsaXN0ZW5lclxuICBsaXN0ZW5lci5wcm94eSA9IGZ1bmN0aW9uIHByb3h5KCAgKXtcbiAgICB2YXIgcmV0ID0gbGlzdGVuZXIuYXBwbHkobnVsbCwgYXJndW1lbnRzKVxuICAgIGNoYW5uZWwudW5zdWJzY3JpYmUobGlzdGVuZXIpXG4gICAgcmV0dXJuIHJldFxuICB9XG4gIHRoaXMuc3Vic2NyaWJlKGxpc3RlbmVyKVxuXG4gIHJldHVybiB0aGlzXG59XG5DaGFubmVsLnByb3RvdHlwZS5pc1N1YnNjcmliZWQgPSBmdW5jdGlvbiggbGlzdGVuZXIgKXtcbiAgcmV0dXJuICEhKGxpc3RlbmVyICYmIH50aGlzLmluZGV4T2YobGlzdGVuZXIpKVxufVxuQ2hhbm5lbC5wcm90b3R5cGUuaGFzU3Vic2NyaWJlcnMgPSBmdW5jdGlvbiggICl7XG4gIHJldHVybiB0aGlzLmxlbmd0aCA+IDBcbn1cbkNoYW5uZWwucHJvdG90eXBlLmVtcHR5ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5zcGxpY2UoMClcbiAgcmV0dXJuIHRoaXNcbn1cbiIsInZhciBDaGFubmVsID0gcmVxdWlyZShcIi4vQ2hhbm5lbFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJhZGlvXG5cbmZ1bmN0aW9uIFJhZGlvKCAgKXtcbiAgdGhpcy5fY2hhbm5lbHMgPSBbXVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIGNoYW5uZWwgaWYgaXQgZG9lc24ndCBleGlzdCBhbHJlYWR5XG4gKiBhbmQgcmV0dXJuIHRoZSBjaGFubmVsLlxuICogKi9cblJhZGlvLnByb3RvdHlwZS5jaGFubmVsID0gZnVuY3Rpb24oIGNoYW5uZWwgKXtcbiAgcmV0dXJuIHRoaXMuX2NoYW5uZWxzW2NoYW5uZWxdXG4gICAgICB8fCAodGhpcy5fY2hhbm5lbHNbY2hhbm5lbF0gPSBuZXcgQ2hhbm5lbChjaGFubmVsKSlcbn1cbi8qKlxuICogQ2hlY2sgaWYgYSBjaGFubmVsIGV4aXN0cy5cbiAqICovXG5SYWRpby5wcm90b3R5cGUuY2hhbm5lbEV4aXN0cyA9IGZ1bmN0aW9uKCBjaGFubmVsICl7XG4gIHJldHVybiAhIWNoYW5uZWwgJiYgKHR5cGVvZiBjaGFubmVsID09IFwic3RyaW5nXCJcbiAgICAgICAgICA/IHRoaXMuX2NoYW5uZWxzLmhhc093blByb3BlcnR5KGNoYW5uZWwpXG4gICAgICAgICAgOiB0aGlzLl9jaGFubmVscy5oYXNPd25Qcm9wZXJ0eShjaGFubmVsLm5hbWUpKVxufVxuLyoqXG4gKiBEZWxldGUgYSBjaGFubmVsLlxuICogKi9cblJhZGlvLnByb3RvdHlwZS5kZWxldGVDaGFubmVsID0gZnVuY3Rpb24oIGNoYW5uZWwgKXtcbiAgaWYoIGNoYW5uZWwgaW5zdGFuY2VvZiBDaGFubmVsICl7XG4gICAgcmV0dXJuIGRlbGV0ZSB0aGlzLl9jaGFubmVsc1tjaGFubmVsLm5hbWVdXG4gIH1cbiAgcmV0dXJuIGRlbGV0ZSB0aGlzLl9jaGFubmVsc1tjaGFubmVsXVxufVxuLyoqXG4gKiBDaGVjayBpZiBhIGNoYW5uZWwgaGFzIGFueSBzdWJzY3JpYmVycy5cbiAqIElmIHRoZSBjaGFubmVsIGRvZXNuJ3QgZXhpc3RzIGl0J3MgYGZhbHNlYC5cbiAqICovXG5SYWRpby5wcm90b3R5cGUuaGFzU3Vic2NyaWJlcnMgPSBmdW5jdGlvbiggY2hhbm5lbCApe1xuICByZXR1cm4gdGhpcy5jaGFubmVsRXhpc3RzKGNoYW5uZWwpICYmIHRoaXMuY2hhbm5lbChjaGFubmVsKS5oYXNTdWJzY3JpYmVycygpXG59XG4vKipcbiAqIENoZWNrIGlmIGEgbGlzdGVuZXIgaXMgc3Vic2NyaWJlZCB0byBhIGNoYW5uZWwuXG4gKiBJZiB0aGUgY2hhbm5lbCBkb2Vzbid0IGV4aXN0cyBpdCdzIGBmYWxzZWAuXG4gKiAqL1xuUmFkaW8ucHJvdG90eXBlLmlzU3Vic2NyaWJlZCA9IGZ1bmN0aW9uKCBjaGFubmVsLCBsaXN0ZW5lciApe1xuICByZXR1cm4gdGhpcy5jaGFubmVsRXhpc3RzKGNoYW5uZWwpICYmIHRoaXMuY2hhbm5lbChjaGFubmVsKS5pc1N1YnNjcmliZWQobGlzdGVuZXIpXG59XG4vKipcbiAqIFNlbmQgYXJndW1lbnRzIG9uIGEgY2hhbm5lbC5cbiAqIElmIHRoZSBjaGFubmVsIGRvZXNuJ3QgZXhpc3RzIG5vdGhpbmcgaGFwcGVucy5cbiAqICovXG5SYWRpby5wcm90b3R5cGUucHVibGlzaCA9IFJhZGlvLnByb3RvdHlwZS5icm9hZGNhc3QgPSBmdW5jdGlvbiggY2hhbm5lbCApe1xuICBpZiggdGhpcy5jaGFubmVsRXhpc3RzKGNoYW5uZWwpICl7XG4gICAgY2hhbm5lbCA9IHRoaXMuY2hhbm5lbChjaGFubmVsKVxuICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgcmV0dXJuIGNoYW5uZWwuYnJvYWRjYXN0LmFwcGx5KGNoYW5uZWwsIGFyZ3MpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG4vKipcbiAqIFN1YnNjcmliZSB0byBhIGNoYW5uZWwgd2l0aCBhIGxpc3RlbmVyLlxuICogSXQgYWxzbyBjcmVhdGVzIHRoZSBjaGFubmVsIGlmIGl0IGRvZXNuJ3QgZXhpc3RzIHlldC5cbiAqICovXG5SYWRpby5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24oIGNoYW5uZWwsIGxpc3RlbmVyICl7XG4gIHRoaXMuY2hhbm5lbChjaGFubmVsKS5zdWJzY3JpYmUobGlzdGVuZXIpXG4gIHJldHVybiB0aGlzXG59XG4vKipcbiAqIFVuc3Vic2NyaWJlIGEgbGlzdGVuZXIgZnJvbSBhIGNoYW5uZWwuXG4gKiBJZiB0aGUgY2hhbm5lbCBkb2Vzbid0IGV4aXN0cyBub3RoaW5nIGhhcHBlbnMuXG4gKiAqL1xuUmFkaW8ucHJvdG90eXBlLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24oIGNoYW5uZWwsIGxpc3RlbmVyICl7XG4gIGlmKCB0aGlzLmNoYW5uZWxFeGlzdHMoY2hhbm5lbCkgKSB7XG4gICAgdGhpcy5jaGFubmVsKGNoYW5uZWwpLnVuc3Vic2NyaWJlKGxpc3RlbmVyKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG4vKipcbiAqIFN1YnNjcmliZSBhIGxpc3RlbmVyIHRvIGEgY2hhbm5lbFxuICogdGhhdCB1bnN1YnNjcmliZXMgYWZ0ZXIgdGhlIGZpcnN0IGJyb2FkY2FzdCBpdCByZWNlaXZlcy5cbiAqIEl0IGFsc28gY3JlYXRlcyB0aGUgY2hhbm5lbCBpZiBpdCBkb2Vzbid0IGV4aXN0cyB5ZXQuXG4gKiAqL1xuUmFkaW8ucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbiggY2hhbm5lbCwgbGlzdGVuZXIgKXtcbiAgdGhpcy5jaGFubmVsKGNoYW5uZWwpLnBlZWsobGlzdGVuZXIpXG4gIHJldHVybiB0aGlzXG59XG4vKipcbiAqIEVtcHR5IGEgY2hhbm5lbCByZW1vdmluZyBldmVyeSBzdWJzY3JpYmVyIGl0IGhvbGRzLFxuICogYnV0IG5vdCBkZWxldGluZyB0aGUgY2hhbm5lbCBpdHNlbGYuXG4gKiBJZiB0aGUgY2hhbm5lbCBkb2Vzbid0IGV4aXN0cyBub3RoaW5nIGhhcHBlbnMuXG4gKiAqL1xuUmFkaW8ucHJvdG90eXBlLmVtcHR5Q2hhbm5lbCA9IGZ1bmN0aW9uKCBjaGFubmVsICl7XG4gIGlmKCB0aGlzLmNoYW5uZWxFeGlzdHMoY2hhbm5lbCkgKSB7XG4gICAgdGhpcy5jaGFubmVsKGNoYW5uZWwpLmVtcHR5KClcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuIiwidmFyIFJhZGlvID0gcmVxdWlyZShcIi4vUmFkaW9cIilcbnZhciBDaGFubmVsID0gcmVxdWlyZShcIi4vQ2hhbm5lbFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJhZGlvXG5tb2R1bGUuZXhwb3J0cy5DaGFubmVsID0gQ2hhbm5lbFxuIiwibW9kdWxlLmV4cG9ydHMgPSBEZXNjcmlwdG9yXG5cbnZhciBfd3JpdGFibGUgPSBcIl93cml0YWJsZVwiXG52YXIgX2VudW1lcmFibGUgPSBcIl9lbnVtZXJhYmxlXCJcbnZhciBfY29uZmlndXJhYmxlID0gXCJfY29uZmlndXJhYmxlXCJcblxuZnVuY3Rpb24gRGVzY3JpcHRvciggd3JpdGFibGUsIGVudW1lcmFibGUsIGNvbmZpZ3VyYWJsZSApe1xuICB0aGlzLnZhbHVlKHRoaXMsIF93cml0YWJsZSwgd3JpdGFibGUgfHwgZmFsc2UpXG4gIHRoaXMudmFsdWUodGhpcywgX2VudW1lcmFibGUsIGVudW1lcmFibGUgfHwgZmFsc2UpXG4gIHRoaXMudmFsdWUodGhpcywgX2NvbmZpZ3VyYWJsZSwgY29uZmlndXJhYmxlIHx8IGZhbHNlKVxuXG4gIHRoaXMuZ2V0dGVyKHRoaXMsIFwid1wiLCBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLndyaXRhYmxlIH0pXG4gIHRoaXMuZ2V0dGVyKHRoaXMsIFwid3JpdGFibGVcIiwgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBuZXcgRGVzY3JpcHRvcih0cnVlLCBlbnVtZXJhYmxlLCBjb25maWd1cmFibGUpXG4gIH0pXG5cbiAgdGhpcy5nZXR0ZXIodGhpcywgXCJlXCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuZW51bWVyYWJsZSB9KVxuICB0aGlzLmdldHRlcih0aGlzLCBcImVudW1lcmFibGVcIiwgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBuZXcgRGVzY3JpcHRvcih3cml0YWJsZSwgdHJ1ZSwgY29uZmlndXJhYmxlKVxuICB9KVxuXG4gIHRoaXMuZ2V0dGVyKHRoaXMsIFwiY1wiLCBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyYWJsZSB9KVxuICB0aGlzLmdldHRlcih0aGlzLCBcImNvbmZpZ3VyYWJsZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIG5ldyBEZXNjcmlwdG9yKHdyaXRhYmxlLCBlbnVtZXJhYmxlLCB0cnVlKVxuICB9KVxufVxuXG5EZXNjcmlwdG9yLnByb3RvdHlwZSA9IHtcbiAgYWNjZXNzb3I6IGZ1bmN0aW9uKCBvYmosIG5hbWUsIGdldHRlciwgc2V0dGVyICl7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgICAgZW51bWVyYWJsZTogdGhpc1tfZW51bWVyYWJsZV0sXG4gICAgICBjb25maWd1cmFibGU6IHRoaXNbX2NvbmZpZ3VyYWJsZV0sXG4gICAgICBnZXQ6IGdldHRlcixcbiAgICAgIHNldDogc2V0dGVyXG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9LFxuICBnZXR0ZXI6IGZ1bmN0aW9uKCBvYmosIG5hbWUsIGZuICl7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgICAgZW51bWVyYWJsZTogdGhpc1tfZW51bWVyYWJsZV0sXG4gICAgICBjb25maWd1cmFibGU6IHRoaXNbX2NvbmZpZ3VyYWJsZV0sXG4gICAgICBnZXQ6IGZuXG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9LFxuICBzZXR0ZXI6IGZ1bmN0aW9uKCBvYmosIG5hbWUsIGZuICl7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgICAgZW51bWVyYWJsZTogdGhpc1tfZW51bWVyYWJsZV0sXG4gICAgICBjb25maWd1cmFibGU6IHRoaXNbX2NvbmZpZ3VyYWJsZV0sXG4gICAgICBzZXQ6IGZuXG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9LFxuICB2YWx1ZTogZnVuY3Rpb24oIG9iaiwgbmFtZSwgdmFsdWUgKXtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICB3cml0YWJsZTogdGhpc1tfd3JpdGFibGVdLFxuICAgICAgZW51bWVyYWJsZTogdGhpc1tfZW51bWVyYWJsZV0sXG4gICAgICBjb25maWd1cmFibGU6IHRoaXNbX2NvbmZpZ3VyYWJsZV0sXG4gICAgICB2YWx1ZTogdmFsdWVcbiAgICB9KVxuICAgIHJldHVybiB0aGlzXG4gIH0sXG4gIG1ldGhvZDogZnVuY3Rpb24oIG9iaiwgbmFtZSwgZm4gKXtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICB3cml0YWJsZTogdGhpc1tfd3JpdGFibGVdLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICBjb25maWd1cmFibGU6IHRoaXNbX2NvbmZpZ3VyYWJsZV0sXG4gICAgICB2YWx1ZTogZm5cbiAgICB9KVxuICAgIHJldHVybiB0aGlzXG4gIH0sXG4gIHByb3BlcnR5OiBmdW5jdGlvbiggb2JqLCBuYW1lLCB2YWx1ZSApe1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgIHdyaXRhYmxlOiB0aGlzW193cml0YWJsZV0sXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdGhpc1tfY29uZmlndXJhYmxlXSxcbiAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgY29uc3RhbnQ6IGZ1bmN0aW9uKCBvYmosIG5hbWUsIHZhbHVlICl7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgdmFsdWU6IHZhbHVlXG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZShcIi4vZXh0ZW5kXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gZXh0ZW5kKHt9LCBvYmopXG59XG4iLCJ2YXIgY29weSA9IHJlcXVpcmUoXCIuL2NvcHlcIilcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZhdWx0cyAob3B0aW9ucywgZGVmYXVsdHMpIHtcbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgcmV0dXJuIGNvcHkoZGVmYXVsdHMpXG4gIH1cblxuICB2YXIgb2JqID0gY29weShvcHRpb25zKVxuXG4gIGZvciAodmFyIHByb3AgaW4gZGVmYXVsdHMpIHtcbiAgICBpZiAoZGVmYXVsdHMuaGFzT3duUHJvcGVydHkocHJvcCkgJiYgIW9wdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgIG9ialtwcm9wXSA9IGRlZmF1bHRzW3Byb3BdXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9ialxufVxuIiwidmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9EZXNjcmlwdG9yXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IERlc2NyaXB0b3IoKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQoIG9iaiwgZXh0ZW5zaW9uICl7XG4gIGZvciggdmFyIG5hbWUgaW4gZXh0ZW5zaW9uICl7XG4gICAgaWYoIGV4dGVuc2lvbi5oYXNPd25Qcm9wZXJ0eShuYW1lKSApIG9ialtuYW1lXSA9IGV4dGVuc2lvbltuYW1lXVxuICB9XG4gIHJldHVybiBvYmpcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIG9iaiwgY2FsbGJhY2sgKXtcbiAgZm9yKCB2YXIgcHJvcCBpbiBvYmogKXtcbiAgICBpZiggb2JqLmhhc093blByb3BlcnR5KHByb3ApICl7XG4gICAgICBjYWxsYmFjayhwcm9wLCBvYmpbcHJvcF0sIG9iailcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9ialxufVxuIiwidmFyIGV4dGVuZCA9IHJlcXVpcmUoXCIuL2V4dGVuZFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBvYmosIGV4dGVuc2lvbiApe1xuICByZXR1cm4gZXh0ZW5kKGV4dGVuZCh7fSwgb2JqKSwgZXh0ZW5zaW9uKVxufVxuIiwidmFyIGluaGVyaXQgPSByZXF1aXJlKFwibWF0Y2hib3gtZmFjdG9yeS9pbmhlcml0XCIpXG52YXIgaW5jbHVkZSA9IHJlcXVpcmUoXCJtYXRjaGJveC1mYWN0b3J5L2luY2x1ZGVcIilcbnZhciBTZWxlY3RvciA9IHJlcXVpcmUoXCJtYXRjaGJveC1kb20vU2VsZWN0b3JcIilcbnZhciBFdmVudCA9IHJlcXVpcmUoXCIuL0V2ZW50XCIpXG52YXIgQ2hpbGQgPSByZXF1aXJlKFwiLi9DaGlsZFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGlvblxuXG5BY3Rpb24uREVGQVVMVF9BVFRSSUJVVEUgPSBcImRhdGEtYWN0aW9uXCJcblxuZnVuY3Rpb24gQWN0aW9uIChhY3Rpb25Jbml0KSB7XG4gIHRoaXMubG9va3VwID0gYWN0aW9uSW5pdC5sb29rdXAgfHwgbnVsbFxuICB0aGlzLmV2ZW50ID0gbmV3IEV2ZW50KGFjdGlvbkluaXQuZXZlbnRPcHRpb25zKVxufVxuXG5BY3Rpb24ucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbiAoYWN0aW9uLCB2aWV3TmFtZSkge1xuICB2YXIgc2VsZWN0b3IgPSBuZXcgU2VsZWN0b3Ioe2F0dHJpYnV0ZTogQWN0aW9uLkRFRkFVTFRfQVRUUklCVVRFLCB2YWx1ZTogYWN0aW9ufSlcblxuICBpZiAoIUFycmF5LmlzQXJyYXkodGhpcy5ldmVudC50YXJnZXQpKSB7XG4gICAgdGhpcy5ldmVudC50YXJnZXQgPSBbXVxuICB9XG5cbiAgdGhpcy5ldmVudC50YXJnZXQgPSB0aGlzLmV2ZW50LnRhcmdldC5tYXAoZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgaWYgKCEodHlwZW9mIHNlbGVjdG9yID09IFwic3RyaW5nXCIpKSB7XG4gICAgICByZXR1cm4gc2VsZWN0b3JcbiAgICB9XG5cbiAgICBpZiAoIXZpZXdOYW1lIHx8IHNlbGVjdG9yWzBdICE9IFNlbGVjdG9yLkRFRkFVTFRfTkVTVF9TRVBBUkFUT1IpIHtcbiAgICAgIHJldHVybiBuZXcgQ2hpbGQoc2VsZWN0b3IpXG4gICAgfVxuXG4gICAgc2VsZWN0b3IgPSBzZWxlY3Rvci5zdWJzdHIoMSlcbiAgICByZXR1cm4gbmV3IENoaWxkKHNlbGVjdG9yKS5wcmVmaXgodmlld05hbWUpXG4gIH0pXG5cbiAgaWYgKHZpZXdOYW1lKSB7XG4gICAgdGhpcy5ldmVudC50YXJnZXQucHVzaChzZWxlY3Rvci5wcmVmaXgodmlld05hbWUpKVxuICB9XG4gIGVsc2Uge1xuICAgIHRoaXMuZXZlbnQudGFyZ2V0LnB1c2goc2VsZWN0b3IpXG4gIH1cblxuICB2YXIgbG9va3VwID0gdGhpcy5sb29rdXBcbiAgdGhpcy5ldmVudC50cmFuc2Zvcm0gPSBmdW5jdGlvbiAodmlldywgZGVsZWdhdGVTZWxlY3RvciwgZGVsZWdhdGVFbGVtZW50KSB7XG4gICAgdmFyIGNoaWxkXG4gICAgaWYgKGRlbGVnYXRlU2VsZWN0b3IgaW5zdGFuY2VvZiBDaGlsZCkge1xuICAgICAgY2hpbGQgPSB2aWV3LmdldENoaWxkVmlldyhkZWxlZ2F0ZVNlbGVjdG9yLm5hbWUsIGRlbGVnYXRlRWxlbWVudClcbiAgICB9XG4gICAgZWxzZSBpZiAoZGVsZWdhdGVTZWxlY3RvciBpbnN0YW5jZW9mIFNlbGVjdG9yICYmIGxvb2t1cCkge1xuICAgICAgY2hpbGQgPSB2aWV3LmdldENoaWxkVmlldyhsb29rdXAsIGRlbGVnYXRlRWxlbWVudClcbiAgICB9XG5cbiAgICByZXR1cm4gY2hpbGQgfHwgZGVsZWdhdGVFbGVtZW50XG4gIH1cbn1cblxuQWN0aW9uLnByb3RvdHlwZS5yZWdpc3RlckV2ZW50ID0gZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRleHQpIHtcbiAgdGhpcy5ldmVudC5yZWdpc3RlcihlbGVtZW50LCBjb250ZXh0KVxufVxuXG5BY3Rpb24ucHJvdG90eXBlLnVuUmVnaXN0ZXJFdmVudCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHRoaXMuZXZlbnQudW5SZWdpc3RlcihlbGVtZW50KVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBBY3Rpb25Jbml0XG5cbmZ1bmN0aW9uIEFjdGlvbkluaXQgKGV2ZW50LCB0YXJnZXQsIGxvb2t1cCwgaGFuZGxlcikge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQWN0aW9uSW5pdCkpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIG5ldyBBY3Rpb25Jbml0KGV2ZW50IHx8IHt9KVxuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gbmV3IEFjdGlvbkluaXQoe1xuICAgICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICAgIGhhbmRsZXI6IHRhcmdldFxuICAgICAgICB9KVxuICAgICAgY2FzZSAzOlxuICAgICAgICByZXR1cm4gbmV3IEFjdGlvbkluaXQoe1xuICAgICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICAgIGhhbmRsZXI6IGxvb2t1cFxuICAgICAgICB9KVxuICAgICAgY2FzZSA0OlxuICAgICAgICByZXR1cm4gbmV3IEFjdGlvbkluaXQoe1xuICAgICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICAgIGxvb2t1cDogbG9va3VwLFxuICAgICAgICAgIGhhbmRsZXI6IGhhbmRsZXJcbiAgICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBjYXNlIDE6XG4gICAgICBldmVudCA9IGV2ZW50IHx8IHt9XG4gICAgICBicmVha1xuICAgIGNhc2UgMjpcbiAgICAgIGV2ZW50ID0ge1xuICAgICAgICB0eXBlOiBldmVudCxcbiAgICAgICAgaGFuZGxlcjogdGFyZ2V0XG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgMzpcbiAgICAgIGV2ZW50ID0ge1xuICAgICAgICB0eXBlOiBldmVudCxcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIGhhbmRsZXI6IGxvb2t1cFxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlIDQ6XG4gICAgICBldmVudCA9IHtcbiAgICAgICAgdHlwZTogZXZlbnQsXG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICBsb29rdXA6IGxvb2t1cCxcbiAgICAgICAgaGFuZGxlcjogaGFuZGxlclxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgfVxuXG4gIHRoaXMuZXZlbnRPcHRpb25zID0gZXZlbnRcbiAgdGhpcy5sb29rdXAgPSBldmVudC5sb29rdXBcbn1cbiIsInZhciBpbmhlcml0ID0gcmVxdWlyZShcIm1hdGNoYm94LWZhY3RvcnkvaW5oZXJpdFwiKVxudmFyIFNlbGVjdG9yID0gcmVxdWlyZShcIm1hdGNoYm94LWRvbS9TZWxlY3RvclwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IENoaWxkXG5cbkNoaWxkLkRFRkFVTFRfQVRUUklCVVRFID0gXCJkYXRhLXZpZXdcIlxuXG5mdW5jdGlvbiBDaGlsZCAoY2hpbGQpIHtcbiAgY2hpbGQgPSBjaGlsZCB8fCB7fVxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ2hpbGQpKSB7XG4gICAgcmV0dXJuIG5ldyBDaGlsZChjaGlsZClcbiAgfVxuXG4gIHN3aXRjaCAodHlwZW9mIGNoaWxkKSB7XG4gICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICBTZWxlY3Rvci5jYWxsKHRoaXMsIHtDb25zdHJ1Y3RvcjogY2hpbGR9KVxuICAgICAgYnJlYWtcbiAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICBTZWxlY3Rvci5jYWxsKHRoaXMsIHt2YWx1ZTogY2hpbGR9KVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgU2VsZWN0b3IuY2FsbCh0aGlzLCBjaGlsZClcbiAgfVxuXG4gIHRoaXMuYXR0cmlidXRlID0gdGhpcy5hdHRyaWJ1dGUgfHwgQ2hpbGQuREVGQVVMVF9BVFRSSUJVVEVcbiAgdGhpcy5hdXRvc2VsZWN0ID0gY2hpbGQuYXV0b3NlbGVjdCA9PSB1bmRlZmluZWQgPyBmYWxzZSA6IGNoaWxkLmF1dG9zZWxlY3RcbiAgdGhpcy5wcm9wZXJ0eSA9IGNoaWxkLnByb3BlcnR5IHx8IHRoaXMudmFsdWVcbiAgdGhpcy5sb29rdXAgPSBjaGlsZC5sb29rdXAgfHwgbnVsbFxuICB0aGlzLm5hbWUgPSBjaGlsZC5uYW1lIHx8IHRoaXMudmFsdWVcbn1cblxuaW5oZXJpdChDaGlsZCwgU2VsZWN0b3IpXG5cbkNoaWxkLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24gKHByb3BlcnR5LCBjaGlsZE5hbWUpIHtcbiAgdGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5XG4gIHRoaXMubmFtZSA9IGNoaWxkTmFtZVxufVxuXG5DaGlsZC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzKVxufVxuIiwidmFyIGluaGVyaXQgPSByZXF1aXJlKFwibWF0Y2hib3gtZmFjdG9yeS9pbmhlcml0XCIpXG52YXIgTW9kaWZpZXJJbml0ID0gcmVxdWlyZShcIi4vTW9kaWZpZXJJbml0XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gRW51bU1vZGlmaWVyXG5cbmZ1bmN0aW9uIEVudW1Nb2RpZmllciAoZGVmYXVsdFZhbHVlLCB2YWx1ZXMsIGFuaW1hdGlvbkR1cmF0aW9uKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBFbnVtTW9kaWZpZXIpKSB7XG4gICAgcmV0dXJuIG5ldyBFbnVtTW9kaWZpZXIoZGVmYXVsdFZhbHVlLCB2YWx1ZXMsIGFuaW1hdGlvbkR1cmF0aW9uKVxuICB9XG5cbiAgdGhpcy50eXBlID0gXCJlbnVtXCJcbiAgdGhpcy5kZWZhdWx0ID0gZGVmYXVsdFZhbHVlXG4gIHRoaXMudmFsdWVzID0gdmFsdWVzXG4gIHRoaXMuYW5pbWF0aW9uRHVyYXRpb24gPSBhbmltYXRpb25EdXJhdGlvblxufVxuXG5pbmhlcml0KEVudW1Nb2RpZmllciwgTW9kaWZpZXJJbml0KVxuIiwidmFyIGRlbGVnYXRlID0gcmVxdWlyZShcIm1hdGNoYm94LWRvbS9ldmVudC9kZWxlZ2F0ZVwiKVxudmFyIFNlbGVjdG9yID0gcmVxdWlyZShcIm1hdGNoYm94LWRvbS9TZWxlY3RvclwiKVxudmFyIENoaWxkID0gcmVxdWlyZShcIi4vQ2hpbGRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudFxuXG5mdW5jdGlvbiBFdmVudCAoZXZlbnRJbml0KSB7XG4gIHRoaXMudHlwZSA9IGV2ZW50SW5pdC50eXBlXG4gIHRoaXMudGFyZ2V0ID0gZXZlbnRJbml0LnRhcmdldFxuICB0aGlzLm9uY2UgPSAhIWV2ZW50SW5pdC5vbmNlXG4gIHRoaXMuY2FwdHVyZSA9ICEhZXZlbnRJbml0LmNhcHR1cmVcbiAgdGhpcy5oYW5kbGVyID0gZXZlbnRJbml0LmhhbmRsZXJcbiAgdGhpcy50cmFuc2Zvcm0gPSBldmVudEluaXQudHJhbnNmb3JtXG4gIHRoaXMucHJveHkgPSB0aGlzLmhhbmRsZXJcbn1cblxuRXZlbnQucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbiAodmlldywgdmlld05hbWUpIHtcbiAgaWYgKHRoaXMudGFyZ2V0KSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHRoaXMudGFyZ2V0KSkge1xuICAgICAgdGhpcy50YXJnZXQgPSBbdGhpcy50YXJnZXRdXG4gICAgfVxuXG4gICAgdGhpcy50YXJnZXQgPSB0aGlzLnRhcmdldC5tYXAoZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gICAgICBpZiAoISh0eXBlb2Ygc2VsZWN0b3IgPT0gXCJzdHJpbmdcIikpIHtcbiAgICAgICAgcmV0dXJuIHNlbGVjdG9yXG4gICAgICB9XG5cbiAgICAgIGlmIChzZWxlY3RvclswXSAhPSBTZWxlY3Rvci5ERUZBVUxUX05FU1RfU0VQQVJBVE9SKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2hpbGQoc2VsZWN0b3IpXG4gICAgICB9XG5cbiAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3Iuc3Vic3RyKDEpXG4gICAgICByZXR1cm4gdmlldy5jaGlsZHJlbltzZWxlY3Rvcl1cbiAgICB9KVxuICB9XG5cbiAgaWYgKCF0aGlzLnRyYW5zZm9ybSkge1xuICAgIHRoaXMudHJhbnNmb3JtID0gZnVuY3Rpb24gKHZpZXcsIGRlbGVnYXRlU2VsZWN0b3IsIGRlbGVnYXRlRWxlbWVudCkge1xuICAgICAgdmFyIGNoaWxkXG4gICAgICBpZiAoZGVsZWdhdGVTZWxlY3RvciBpbnN0YW5jZW9mIENoaWxkKSB7XG4gICAgICAgIGNoaWxkID0gdmlldy5nZXRDaGlsZFZpZXcoZGVsZWdhdGVTZWxlY3Rvci5wcm9wZXJ0eSwgZGVsZWdhdGVFbGVtZW50KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2hpbGQgfHwgZGVsZWdhdGVFbGVtZW50XG4gICAgfVxuICB9XG59XG5cbkV2ZW50LnByb3RvdHlwZS5yZWdpc3RlciA9IGZ1bmN0aW9uIChlbGVtZW50LCBjb250ZXh0KSB7XG4gIGlmICh0aGlzLnRhcmdldCkge1xuICAgIHRoaXMucHJveHkgPSBkZWxlZ2F0ZSh7XG4gICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgZXZlbnQ6IHRoaXMudHlwZSxcbiAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICB0cmFuc2Zvcm06IHRoaXMudHJhbnNmb3JtXG4gICAgfSlcbiAgICB0aGlzLnByb3h5Lm1hdGNoKHRoaXMudGFyZ2V0LCB0aGlzLmhhbmRsZXIpXG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKHRoaXMub25jZSkge1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy5oYW5kbGVyLCB0aGlzLmNhcHR1cmUpXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy5oYW5kbGVyLCB0aGlzLmNhcHR1cmUpXG4gICAgfVxuICB9XG59XG5cbkV2ZW50LnByb3RvdHlwZS51blJlZ2lzdGVyID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgaWYgKHRoaXMucHJveHkpIHtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy50eXBlLCB0aGlzLnByb3h5LCB0aGlzLmNhcHR1cmUpXG4gIH1cbiAgZWxzZSB7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy5oYW5kbGVyLCB0aGlzLmNhcHR1cmUpXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gRXZlbnRJbml0XG5cbmZ1bmN0aW9uIEV2ZW50SW5pdCAoZXZlbnQsIHRhcmdldCwgY2FwdHVyZSwgb25jZSwgaGFuZGxlcikge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgRXZlbnRJbml0KSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gbmV3IEV2ZW50SW5pdChldmVudClcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgcmV0dXJuIG5ldyBFdmVudEluaXQoe1xuICAgICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICAgIGhhbmRsZXI6IHRhcmdldFxuICAgICAgICB9KVxuICAgICAgY2FzZSAzOlxuICAgICAgICByZXR1cm4gbmV3IEV2ZW50SW5pdCh7XG4gICAgICAgICAgdHlwZTogZXZlbnQsXG4gICAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgICAgaGFuZGxlcjogY2FwdHVyZVxuICAgICAgICB9KVxuICAgICAgY2FzZSA0OlxuICAgICAgICByZXR1cm4gbmV3IEV2ZW50SW5pdCh7XG4gICAgICAgICAgdHlwZTogZXZlbnQsXG4gICAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgICAgY2FwdHVyZTogY2FwdHVyZSxcbiAgICAgICAgICBoYW5kbGVyOiBvbmNlXG4gICAgICAgIH0pXG4gICAgICBjYXNlIDU6XG4gICAgICAgIHJldHVybiBuZXcgRXZlbnRJbml0KHtcbiAgICAgICAgICB0eXBlOiBldmVudCxcbiAgICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgICBjYXB0dXJlOiBjYXB0dXJlLFxuICAgICAgICAgIG9uY2U6IG9uY2UsXG4gICAgICAgICAgaGFuZGxlcjogaGFuZGxlclxuICAgICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGNhc2UgMTpcbiAgICAgICAgZXZlbnQgPSBldmVudCB8fCB7fVxuICAgICAgYnJlYWtcbiAgICBjYXNlIDI6XG4gICAgICBldmVudCA9IHtcbiAgICAgICAgdHlwZTogZXZlbnQsXG4gICAgICAgIGhhbmRsZXI6IHRhcmdldFxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlIDM6XG4gICAgICBldmVudCA9IHtcbiAgICAgICAgdHlwZTogZXZlbnQsXG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICBoYW5kbGVyOiBjYXB0dXJlXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgNDpcbiAgICAgIGV2ZW50ID0ge1xuICAgICAgICB0eXBlOiBldmVudCxcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIGNhcHR1cmU6IGNhcHR1cmUsXG4gICAgICAgIGhhbmRsZXI6IG9uY2VcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgY2FzZSA1OlxuICAgICAgZXZlbnQgPSB7XG4gICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgY2FwdHVyZTogY2FwdHVyZSxcbiAgICAgICAgb25jZTogb25jZSxcbiAgICAgICAgaGFuZGxlcjogaGFuZGxlclxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgfVxuXG4gIHRoaXMudHlwZSA9IGV2ZW50LnR5cGVcbiAgdGhpcy50YXJnZXQgPSBldmVudC50YXJnZXRcbiAgdGhpcy5vbmNlID0gISFldmVudC5vbmNlXG4gIHRoaXMuY2FwdHVyZSA9ICEhZXZlbnQuY2FwdHVyZVxuICB0aGlzLmhhbmRsZXIgPSBldmVudC5oYW5kbGVyXG4gIHRoaXMudHJhbnNmb3JtID0gZXZlbnQudHJhbnNmb3JtXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IE1vZGlmaWVyXG5cbmZ1bmN0aW9uIE1vZGlmaWVyIChtb2RpZkluaXQpIHtcbiAgdGhpcy50eXBlID0gbW9kaWZJbml0LnR5cGVcbiAgdGhpcy5kZWZhdWx0ID0gbW9kaWZJbml0LmRlZmF1bHQgPT0gbnVsbCA/IG51bGwgOiBtb2RpZkluaXQuZGVmYXVsdFxuICB0aGlzLnZhbHVlcyA9IFtdXG4gIHRoaXMudmFsdWUgPSBudWxsXG4gIHRoaXMub25jaGFuZ2UgPSBudWxsXG4gIHRoaXMuYW5pbWF0aW9uRHVyYXRpb24gPSBtb2RpZkluaXQuYW5pbWF0aW9uRHVyYXRpb24gfHwgMFxuICB0aGlzLnRpbWVySWQgPSBudWxsXG4gIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgY2FzZSBcInN3aXRjaFwiOlxuICAgICAgdGhpcy52YWx1ZXMucHVzaChtb2RpZkluaXQub24gJiYgdHlwZW9mIG1vZGlmSW5pdC5vbiA9PSBcInN0cmluZ1wiID8gbW9kaWZJbml0Lm9uIDogbnVsbClcbiAgICAgIHRoaXMudmFsdWVzLnB1c2gobW9kaWZJbml0Lm9mZiAmJiB0eXBlb2YgbW9kaWZJbml0Lm9mZiA9PSBcInN0cmluZ1wiID8gbW9kaWZJbml0Lm9mZiA6IG51bGwpXG4gICAgICBicmVha1xuICAgIGNhc2UgXCJlbnVtXCI6XG4gICAgICB0aGlzLnZhbHVlcyA9IG1vZGlmSW5pdC52YWx1ZXMgfHwgW11cbiAgICAgIGJyZWFrXG4gIH1cbn1cblxuTW9kaWZpZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRleHQpIHtcbiAgdmFyIGN1cnJlbnRWYWx1ZVxuICB2YXIgaGFzSW5pdGlhbFZhbHVlID0gdGhpcy52YWx1ZXMuc29tZShmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgJiYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnModmFsdWUpKSB7XG4gICAgICBjdXJyZW50VmFsdWUgPSB2YWx1ZVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH0pXG5cbiAgaWYgKGhhc0luaXRpYWxWYWx1ZSkge1xuICAgIGlmICh0aGlzLnR5cGUgPT0gXCJzd2l0Y2hcIikge1xuICAgICAgLy8gb25cbiAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHRoaXMudmFsdWVzWzBdKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0cnVlXG4gICAgICB9XG4gICAgICAvLyBvZmZcbiAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHRoaXMudmFsdWVzWzFdKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMudmFsdWUgPSBjdXJyZW50VmFsdWVcbiAgICB9XG4gIH1cbiAgZWxzZSBpZiAodGhpcy5kZWZhdWx0ICE9IG51bGwpIHtcbiAgICB0aGlzLnNldCh0aGlzLmRlZmF1bHQsIGVsZW1lbnQsIGNvbnRleHQpXG4gIH1cbn1cblxuTW9kaWZpZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMudmFsdWVcbn1cblxuTW9kaWZpZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2YWx1ZSwgZWxlbWVudCwgY29udGV4dCkge1xuICBjb250ZXh0ID0gY29udGV4dCB8fCBlbGVtZW50XG5cbiAgdmFyIHByZXZpb3VzVmFsdWUgPSB0aGlzLnZhbHVlXG4gIHZhciBwcmV2aW91c0NsYXNzTmFtZSA9IHByZXZpb3VzVmFsdWVcbiAgdmFyIG5ld1ZhbHVlID0gdmFsdWVcbiAgdmFyIG5ld0NsYXNzTmFtZSA9IHZhbHVlXG5cbiAgaWYgKHRoaXMudHlwZSA9PSBcInN3aXRjaFwiKSB7XG4gICAgbmV3VmFsdWUgPSAhIXZhbHVlXG5cbiAgICB2YXIgb24gPSB0aGlzLnZhbHVlc1swXVxuICAgIHZhciBvZmYgPSB0aGlzLnZhbHVlc1sxXVxuXG4gICAgcHJldmlvdXNDbGFzc05hbWUgPSBwcmV2aW91c1ZhbHVlID09IG51bGxcbiAgICAgICAgPyBudWxsXG4gICAgICAgIDogcHJldmlvdXNWYWx1ZSA/IG9uIDogb2ZmXG4gICAgbmV3Q2xhc3NOYW1lID0gbmV3VmFsdWUgPyBvbiA6IG9mZlxuICB9XG5cbiAgaWYgKHByZXZpb3VzVmFsdWUgPT09IG5ld1ZhbHVlIHx8ICF+dGhpcy52YWx1ZXMuaW5kZXhPZihuZXdDbGFzc05hbWUpKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIH1cbiAgaWYgKHByZXZpb3VzQ2xhc3NOYW1lICYmIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKHByZXZpb3VzQ2xhc3NOYW1lKSkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShwcmV2aW91c0NsYXNzTmFtZSlcbiAgfVxuICB0aGlzLnZhbHVlID0gbmV3VmFsdWVcbiAgaWYgKG5ld0NsYXNzTmFtZSkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChuZXdDbGFzc05hbWUpXG4gIH1cblxuICByZXR1cm4gY2FsbE9uQ2hhbmdlKHRoaXMsIGNvbnRleHQsIHByZXZpb3VzVmFsdWUsIG5ld1ZhbHVlKVxufVxuXG5Nb2RpZmllci5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRleHQpIHtcbiAgY29udGV4dCA9IGNvbnRleHQgfHwgZWxlbWVudFxuICBpZiAodGhpcy52YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIH1cbiAgaWYgKHRoaXMudGltZXJJZCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVySWQpXG4gICAgdGhpcy50aW1lcklkID0gbnVsbFxuICB9XG5cbiAgdmFyIHByZXZpb3VzVmFsdWUgPSB0aGlzLnZhbHVlXG4gIHZhciBwcmV2aW91c0NsYXNzTmFtZSA9IHByZXZpb3VzVmFsdWVcblxuICBpZiAodGhpcy50eXBlID09IFwic3dpdGNoXCIpIHtcbiAgICB2YXIgb24gPSB0aGlzLnZhbHVlc1swXVxuICAgIHZhciBvZmYgPSB0aGlzLnZhbHVlc1sxXVxuXG4gICAgcHJldmlvdXNDbGFzc05hbWUgPSBwcmV2aW91c1ZhbHVlID09IG51bGxcbiAgICAgICAgPyBudWxsXG4gICAgICAgIDogcHJldmlvdXNWYWx1ZSA/IG9uIDogb2ZmXG4gIH1cblxuICBpZiAocHJldmlvdXNDbGFzc05hbWUgJiYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMocHJldmlvdXNDbGFzc05hbWUpKSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHByZXZpb3VzQ2xhc3NOYW1lKVxuICB9XG4gIHRoaXMudmFsdWUgPSBudWxsXG5cbiAgcmV0dXJuIGNhbGxPbkNoYW5nZSh0aGlzLCBjb250ZXh0LCBwcmV2aW91c1ZhbHVlLCBudWxsKVxufVxuXG5mdW5jdGlvbiBjYWxsT25DaGFuZ2UgKG1vZGlmaWVyLCBjb250ZXh0LCBwcmV2aW91c1ZhbHVlLCBuZXdWYWx1ZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICBpZiAobW9kaWZpZXIuYW5pbWF0aW9uRHVyYXRpb24pIHtcbiAgICAgIGlmIChtb2RpZmllci50aW1lcklkKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChtb2RpZmllci50aW1lcklkKVxuICAgICAgICBtb2RpZmllci50aW1lcklkID0gbnVsbFxuICAgICAgfVxuICAgICAgbW9kaWZpZXIudGltZXJJZCA9IHNldFRpbWVvdXQocmVzb2x2ZSwgbW9kaWZpZXIuYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmVzb2x2ZSgpXG4gICAgfVxuICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBtb2RpZmllci5vbmNoYW5nZSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICByZXR1cm4gbW9kaWZpZXIub25jaGFuZ2UuY2FsbChjb250ZXh0LCBwcmV2aW91c1ZhbHVlLCBuZXdWYWx1ZSlcbiAgICAgICAgfVxuICAgICAgfSlcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gTW9kaWZpZXJJbml0XG5cbmZ1bmN0aW9uIE1vZGlmaWVySW5pdCAob3B0aW9ucykge1xuICB0aGlzLnR5cGUgPSBvcHRpb25zLnR5cGVcbiAgdGhpcy5kZWZhdWx0ID0gb3B0aW9ucy5kZWZhdWx0ID09IG51bGwgPyBudWxsIDogb3B0aW9ucy5kZWZhdWx0XG4gIHRoaXMudmFsdWVzID0gb3B0aW9ucy52YWx1ZXNcbiAgdGhpcy5hbmltYXRpb25EdXJhdGlvbiA9IG9wdGlvbnMuYW5pbWF0aW9uRHVyYXRpb25cbn1cbiIsInZhciBpbmhlcml0ID0gcmVxdWlyZShcIm1hdGNoYm94LWZhY3RvcnkvaW5oZXJpdFwiKVxudmFyIE1vZGlmaWVySW5pdCA9IHJlcXVpcmUoXCIuL01vZGlmaWVySW5pdFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN3aXRjaE1vZGlmaWVyXG5cbmZ1bmN0aW9uIFN3aXRjaE1vZGlmaWVyIChkZWZhdWx0VmFsdWUsIG9uLCBvZmYsIGFuaW1hdGlvbkR1cmF0aW9uKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBTd2l0Y2hNb2RpZmllcikpIHtcbiAgICByZXR1cm4gbmV3IFN3aXRjaE1vZGlmaWVyKGRlZmF1bHRWYWx1ZSwgb24sIG9mZiwgYW5pbWF0aW9uRHVyYXRpb24pXG4gIH1cblxuICB0aGlzLnR5cGUgPSBcInN3aXRjaFwiXG4gIHRoaXMuZGVmYXVsdCA9IGRlZmF1bHRWYWx1ZVxuICB0aGlzLm9uID0gb25cbiAgdGhpcy5vZmYgPSBvZmZcbiAgdGhpcy5hbmltYXRpb25EdXJhdGlvbiA9IGFuaW1hdGlvbkR1cmF0aW9uXG59XG5cbmluaGVyaXQoU3dpdGNoTW9kaWZpZXIsIE1vZGlmaWVySW5pdClcbiIsInZhciBkZWZpbmUgPSByZXF1aXJlKFwibWF0Y2hib3gtdXRpbC9vYmplY3QvZGVmaW5lXCIpXG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKFwibWF0Y2hib3gtdXRpbC9vYmplY3QvZGVmYXVsdHNcIilcbnZhciBmb3JJbiA9IHJlcXVpcmUoXCJtYXRjaGJveC11dGlsL29iamVjdC9pblwiKVxudmFyIGZhY3RvcnkgPSByZXF1aXJlKFwibWF0Y2hib3gtZmFjdG9yeVwiKVxudmFyIEluc3RhbmNlRXh0ZW5zaW9uID0gcmVxdWlyZShcIm1hdGNoYm94LWZhY3RvcnkvSW5zdGFuY2VFeHRlbnNpb25cIilcbnZhciBDYWNoZUV4dGVuc2lvbiA9IHJlcXVpcmUoXCJtYXRjaGJveC1mYWN0b3J5L0NhY2hlRXh0ZW5zaW9uXCIpXG52YXIgRG9tRGF0YSA9IHJlcXVpcmUoXCJtYXRjaGJveC1kb20vRGF0YVwiKVxudmFyIGRvbURhdGEgPSByZXF1aXJlKFwibWF0Y2hib3gtZG9tL2RhdGFcIilcbnZhciBTZWxlY3RvciA9IHJlcXVpcmUoXCJtYXRjaGJveC1kb20vU2VsZWN0b3JcIilcbnZhciBSYWRpbyA9IHJlcXVpcmUoXCJtYXRjaGJveC1yYWRpb1wiKVxudmFyIEZyYWdtZW50ID0gcmVxdWlyZShcIm1hdGNoYm94LWRvbS9GcmFnbWVudFwiKVxudmFyIEV2ZW50SW5pdCA9IHJlcXVpcmUoXCIuL0V2ZW50SW5pdFwiKVxudmFyIEFjdGlvbkluaXQgPSByZXF1aXJlKFwiLi9BY3Rpb25Jbml0XCIpXG52YXIgTW9kaWZpZXJJbml0ID0gcmVxdWlyZShcIi4vTW9kaWZpZXJJbml0XCIpXG52YXIgRXZlbnQgPSByZXF1aXJlKFwiLi9FdmVudFwiKVxudmFyIE1vZGlmaWVyID0gcmVxdWlyZShcIi4vTW9kaWZpZXJcIilcbnZhciBDaGlsZCA9IHJlcXVpcmUoXCIuL0NoaWxkXCIpXG52YXIgQWN0aW9uID0gcmVxdWlyZShcIi4vQWN0aW9uXCIpXG5cbnZhciBWaWV3ID0gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHtcbiAgaW5jbHVkZTogW1JhZGlvXSxcblxuICBleHRlbnNpb25zOiB7XG4gICAgbGF5b3V0czogbmV3IENhY2hlRXh0ZW5zaW9uKCksXG4gICAgbW9kZWxzOiBuZXcgQ2FjaGVFeHRlbnNpb24oKSxcbiAgICBldmVudHM6IG5ldyBJbnN0YW5jZUV4dGVuc2lvbihmdW5jdGlvbiAodmlldywgbmFtZSwgaW5pdCkge1xuICAgICAgdmFyIGV2ZW50XG4gICAgICBpZiAoIShpbml0IGluc3RhbmNlb2YgRXZlbnRJbml0KSkge1xuICAgICAgICBpbml0ID0gbmV3IEV2ZW50SW5pdChpbml0KVxuICAgICAgfVxuICAgICAgZXZlbnQgPSBuZXcgRXZlbnQoaW5pdClcblxuICAgICAgaWYgKHR5cGVvZiBldmVudC5oYW5kbGVyID09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHZpZXdbZXZlbnQuaGFuZGxlcl0gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGV2ZW50LmhhbmRsZXIgPSB2aWV3W2V2ZW50LmhhbmRsZXJdLmJpbmQodmlldylcbiAgICAgIH1cblxuICAgICAgaWYgKHZpZXcudmlld05hbWUpIHtcbiAgICAgICAgZXZlbnQuaW5pdGlhbGl6ZSh2aWV3LCB2aWV3LnZpZXdOYW1lKVxuICAgICAgfVxuXG4gICAgICB2aWV3Ll9ldmVudHNbbmFtZV0gPSBldmVudFxuICAgIH0pLFxuICAgIGFjdGlvbnM6IG5ldyBJbnN0YW5jZUV4dGVuc2lvbihmdW5jdGlvbiAodmlldywgbmFtZSwgaW5pdCkge1xuICAgICAgaWYgKCEoaW5pdCBpbnN0YW5jZW9mIEFjdGlvbkluaXQpKSB7XG4gICAgICAgIGluaXQgPSBuZXcgQWN0aW9uSW5pdChpbml0KVxuICAgICAgfVxuXG4gICAgICB2YXIgYWN0aW9uID0gbmV3IEFjdGlvbihpbml0KVxuICAgICAgYWN0aW9uLmluaXRpYWxpemUobmFtZSwgdmlldy52aWV3TmFtZSlcblxuICAgICAgaWYgKHR5cGVvZiBhY3Rpb24uaGFuZGxlciA9PSBcInN0cmluZ1wiICYmIHR5cGVvZiB2aWV3W2FjdGlvbi5oYW5kbGVyXSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgYWN0aW9uLmhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHZpZXdbYWN0aW9uLmhhbmRsZXJdLmFwcGx5KHZpZXcsIGFyZ3VtZW50cylcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmlldy5fYWN0aW9uc1tuYW1lXSA9IGFjdGlvblxuICAgIH0pLFxuICAgIGRhdGFzZXQ6IG5ldyBDYWNoZUV4dGVuc2lvbihmdW5jdGlvbiAocHJvdG90eXBlLCBuYW1lLCBkYXRhKSB7XG4gICAgICBpZiAoIShkYXRhIGluc3RhbmNlb2YgRG9tRGF0YSkpIHtcbiAgICAgICAgZGF0YSA9IGRvbURhdGEuY3JlYXRlKG5hbWUsIGRhdGEpXG4gICAgICB9XG4gICAgICBkYXRhLm5hbWUgPSBkYXRhLm5hbWUgfHwgbmFtZVxuXG4gICAgICByZXR1cm4gZGF0YVxuICAgIH0pLFxuICAgIG1vZGlmaWVyczogbmV3IEluc3RhbmNlRXh0ZW5zaW9uKGZ1bmN0aW9uICh2aWV3LCBuYW1lLCBtb2RpZkluaXQpIHtcbiAgICAgIGlmICghKG1vZGlmSW5pdCBpbnN0YW5jZW9mIE1vZGlmaWVySW5pdCkpIHtcbiAgICAgICAgbW9kaWZJbml0ID0gbmV3IE1vZGlmaWVySW5pdChtb2RpZkluaXQpXG4gICAgICB9XG4gICAgICB2aWV3Ll9tb2RpZmllcnNbbmFtZV0gPSBuZXcgTW9kaWZpZXIobW9kaWZJbml0KVxuICAgIH0pLFxuICAgIGNoaWxkcmVuOiBuZXcgQ2FjaGVFeHRlbnNpb24oZnVuY3Rpb24ocHJvdG90eXBlLCBuYW1lLCBjaGlsZCl7XG4gICAgICBpZiAoIShjaGlsZCBpbnN0YW5jZW9mIFNlbGVjdG9yKSkge1xuICAgICAgICBjaGlsZCA9IG5ldyBDaGlsZChjaGlsZClcbiAgICAgIH1cblxuICAgICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgQ2hpbGQpIHtcbiAgICAgICAgY2hpbGQuaW5pdGlhbGl6ZShuYW1lLCBjaGlsZC52YWx1ZSB8fCBuYW1lKVxuICAgICAgfVxuXG4gICAgICBpZiAocHJvdG90eXBlLnZpZXdOYW1lKSB7XG4gICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIENoaWxkKSB7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkLmNvbnRhaW5zKGNoaWxkLm5hbWUpLnByZWZpeChwcm90b3R5cGUudmlld05hbWUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGlsZC5jb250YWlucyhjaGlsZC5uYW1lKVxuICAgIH0pLFxuICAgIGZyYWdtZW50czogbmV3IENhY2hlRXh0ZW5zaW9uKGZ1bmN0aW9uIChwcm90b3R5cGUsIG5hbWUsIGZyYWdtZW50KSB7XG4gICAgICBpZiAoIShmcmFnbWVudCBpbnN0YW5jZW9mIEZyYWdtZW50KSkge1xuICAgICAgICByZXR1cm4gbmV3IEZyYWdtZW50KGZyYWdtZW50KVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZyYWdtZW50XG4gICAgfSlcbiAgfSxcblxuICBsYXlvdXRzOiB7fSxcbiAgbW9kZWxzOiB7fSxcbiAgZXZlbnRzOiB7fSxcbiAgZGF0YXNldDoge30sXG4gIG1vZGlmaWVyczoge30sXG4gIGZyYWdtZW50czoge30sXG4gIGNoaWxkcmVuOiB7fSxcblxuICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gVmlldyggZWxlbWVudCApe1xuICAgIFJhZGlvLmNhbGwodGhpcylcbiAgICBkZWZpbmUudmFsdWUodGhpcywgXCJfZXZlbnRzXCIsIHt9KVxuICAgIGRlZmluZS52YWx1ZSh0aGlzLCBcIl9tb2RlbHNcIiwge30pXG4gICAgZGVmaW5lLnZhbHVlKHRoaXMsIFwiX2FjdGlvbnNcIiwge30pXG4gICAgZGVmaW5lLnZhbHVlKHRoaXMsIFwiX21vZGlmaWVyc1wiLCB7fSlcbiAgICBkZWZpbmUud3JpdGFibGUudmFsdWUodGhpcywgXCJfZWxlbWVudFwiLCBudWxsKVxuICAgIGRlZmluZS53cml0YWJsZS52YWx1ZSh0aGlzLCBcImN1cnJlbnRMYXlvdXRcIiwgXCJcIilcbiAgICBWaWV3LmluaXRpYWxpemUodGhpcylcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50XG4gIH0sXG5cbiAgYWNjZXNzb3I6IHtcbiAgICBlbGVtZW50OiB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHZhciBwcmV2aW91cyA9IHRoaXMuX2VsZW1lbnRcbiAgICAgICAgaWYgKHByZXZpb3VzID09IGVsZW1lbnQpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZWxlbWVudFxuICAgICAgICB0aGlzLm9uRWxlbWVudENoYW5nZShlbGVtZW50LCBwcmV2aW91cylcbiAgICAgIH1cbiAgICB9LFxuICAgIGVsZW1lbnRTZWxlY3Rvcjoge1xuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnZpZXdOYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBDaGlsZCh0aGlzLnZpZXdOYW1lKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHByb3RvdHlwZToge1xuICAgIHZpZXdOYW1lOiBcIlwiLFxuICAgIG9uRWxlbWVudENoYW5nZTogZnVuY3Rpb24gKGVsZW1lbnQsIHByZXZpb3VzKSB7XG4gICAgICB2YXIgdmlldyA9IHRoaXNcbiAgICAgIGZvckluKHRoaXMuX2V2ZW50cywgZnVuY3Rpb24gKG5hbWUsIGV2ZW50KSB7XG4gICAgICAgIGlmIChwcmV2aW91cykgZXZlbnQudW5SZWdpc3RlcihwcmV2aW91cylcbiAgICAgICAgaWYgKGVsZW1lbnQpIGV2ZW50LnJlZ2lzdGVyKGVsZW1lbnQsIHZpZXcpXG4gICAgICB9KVxuICAgICAgZm9ySW4odGhpcy5fYWN0aW9ucywgZnVuY3Rpb24gKG5hbWUsIGFjdGlvbikge1xuICAgICAgICBpZiAocHJldmlvdXMpIGFjdGlvbi51blJlZ2lzdGVyRXZlbnQocHJldmlvdXMpXG4gICAgICAgIGlmIChlbGVtZW50KSBhY3Rpb24ucmVnaXN0ZXJFdmVudChlbGVtZW50LCB2aWV3KVxuICAgICAgfSlcbiAgICAgIGZvckluKHRoaXMuX21vZGlmaWVycywgZnVuY3Rpb24gKG5hbWUsIG1vZGlmaWVyKSB7XG4gICAgICAgIG1vZGlmaWVyLnJlc2V0KGVsZW1lbnQsIHZpZXcpXG4gICAgICB9KVxuICAgICAgZm9ySW4odGhpcy5kYXRhc2V0LCBmdW5jdGlvbiAobmFtZSwgZGF0YSkge1xuICAgICAgICBpZiAoIWRhdGEuaGFzKGVsZW1lbnQpICYmIGRhdGEuZGVmYXVsdCAhPSBudWxsKSB7XG4gICAgICAgICAgZGF0YS5zZXQoZWxlbWVudCwgZGF0YS5kZWZhdWx0KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgZm9ySW4odGhpcy5jaGlsZHJlbiwgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgdmFyIGNoaWxkID0gdmlldy5jaGlsZHJlbltuYW1lXVxuICAgICAgICBpZiAoY2hpbGQgJiYgY2hpbGQuYXV0b3NlbGVjdCkge1xuICAgICAgICAgIHZpZXdbbmFtZV0gPSB2aWV3LmZpbmRDaGlsZChuYW1lKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgZm9ySW4odGhpcy5tb2RlbHMsIGZ1bmN0aW9uIChuYW1lLCBDb25zdHJ1Y3Rvcikge1xuICAgICAgICB2aWV3Ll9tb2RlbHNbbmFtZV0gPSBuZXcgQ29uc3RydWN0b3IoKVxuICAgICAgfSlcbiAgICB9LFxuICAgIG9uTGF5b3V0Q2hhbmdlOiBmdW5jdGlvbiAobGF5b3V0LCBwcmV2aW91cykge30sXG4gICAgY2hhbmdlTGF5b3V0OiBmdW5jdGlvbiggbGF5b3V0ICl7XG4gICAgICBpZiAodGhpcy5jdXJyZW50TGF5b3V0ID09IGxheW91dCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgIH1cblxuICAgICAgdmFyIGxheW91dEhhbmRsZXIgPSB0aGlzLmxheW91dHNbbGF5b3V0XVxuICAgICAgaWYgKHR5cGVvZiBsYXlvdXRIYW5kbGVyICE9IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwiSW52YWxpZCBsYXlvdXQgaGFuZGxlcjogXCIgKyBsYXlvdXQpKVxuICAgICAgfVxuXG4gICAgICB2YXIgdmlldyA9IHRoaXNcbiAgICAgIHZhciBwcmV2aW91cyA9IHZpZXcuY3VycmVudExheW91dFxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShwcmV2aW91cykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBsYXlvdXRIYW5kbGVyLmNhbGwodmlldywgcHJldmlvdXMpXG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmlldy5jdXJyZW50TGF5b3V0ID0gbGF5b3V0XG4gICAgICAgIHZpZXcub25MYXlvdXRDaGFuZ2UocHJldmlvdXMsIGxheW91dClcbiAgICAgIH0pXG4gICAgfSxcbiAgICBkaXNwYXRjaDogZnVuY3Rpb24gKHR5cGUsIGRldGFpbCwgZGVmKSB7XG4gICAgICB2YXIgZGVmaW5pdGlvbiA9IGRlZmF1bHRzKGRlZiwge1xuICAgICAgICBkZXRhaWw6IGRldGFpbCB8fCBudWxsLFxuICAgICAgICB2aWV3OiB3aW5kb3csXG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGNhbmNlbGFibGU6IHRydWVcbiAgICAgIH0pXG4gICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IHdpbmRvdy5DdXN0b21FdmVudCh0eXBlLCBkZWZpbml0aW9uKSlcbiAgICB9LFxuICAgIGdldERhdGE6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YXNldFtuYW1lXVxuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRhdGEuZ2V0KHRoaXMuZWxlbWVudClcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsXG4gICAgfSxcbiAgICBzZXREYXRhOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUsIHNpbGVudCkge1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGFzZXRbbmFtZV1cbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhLnNldCh0aGlzLmVsZW1lbnQsIHZhbHVlLCBzaWxlbnQpXG4gICAgICB9XG4gICAgfSxcbiAgICByZW1vdmVEYXRhOiBmdW5jdGlvbiAobmFtZSwgc2lsZW50KSB7XG4gICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YXNldFtuYW1lXVxuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgZGF0YS5yZW1vdmUodGhpcy5lbGVtZW50LCBzaWxlbnQpXG4gICAgICB9XG4gICAgfSxcbiAgICBoYXNEYXRhOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGFzZXRbbmFtZV1cbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhLmhhcyh0aGlzLmVsZW1lbnQpXG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9LFxuICAgIHNldE1vZGlmaWVyOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLl9tb2RpZmllcnNbbmFtZV0gJiYgdGhpcy5lbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2RpZmllcnNbbmFtZV0uc2V0KHZhbHVlLCB0aGlzLmVsZW1lbnQsIHRoaXMpXG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRNb2RpZmllcjogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIGlmICh0aGlzLl9tb2RpZmllcnNbbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZGlmaWVyc1tuYW1lXS5nZXQoKVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVtb3ZlTW9kaWZpZXI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICBpZiAodGhpcy5fbW9kaWZpZXJzW25hbWVdKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2RpZmllcnNbbmFtZV0ucmVtb3ZlKHRoaXMuZWxlbWVudCwgdGhpcylcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldE1vZGVsOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgbmFtZSA9IG5hbWUgfHwgXCJkZWZhdWx0XCJcbiAgICAgIHZhciBtb2RlbCA9IHRoaXMuX21vZGVsc1tuYW1lXVxuICAgICAgaWYgKG1vZGVsID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIGFjY2VzcyB1bmtub3duIG1vZGVsXCIpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtb2RlbFxuICAgIH0sXG4gICAgc2V0TW9kZWw6IGZ1bmN0aW9uIChuYW1lLCBtb2RlbCkge1xuICAgICAgaWYgKCFtb2RlbCkge1xuICAgICAgICBtb2RlbCA9IG5hbWVcbiAgICAgICAgbmFtZSA9IFwiZGVmYXVsdFwiXG4gICAgICB9XG4gICAgICB0aGlzLl9tb2RlbHNbbmFtZV0gPSBtb2RlbFxuICAgIH0sXG4gICAgc2V0dXBFbGVtZW50OiBmdW5jdGlvbiAocm9vdCkge1xuICAgICAgcm9vdCA9IHJvb3QgfHwgZG9jdW1lbnQuYm9keVxuICAgICAgaWYgKHJvb3QgJiYgdGhpcy5lbGVtZW50U2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy5lbGVtZW50U2VsZWN0b3IuZnJvbShyb290KS5maW5kKClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuICAgIGdldENoaWxkVmlldzogZnVuY3Rpb24gKGNoaWxkUHJvcGVydHksIGVsZW1lbnQpIHtcbiAgICAgIHZhciBjaGlsZCA9IHRoaXMuY2hpbGRyZW5bY2hpbGRQcm9wZXJ0eV1cbiAgICAgIHZhciBtZW1iZXIgPSB0aGlzW2NoaWxkUHJvcGVydHldXG5cbiAgICAgIGlmIChjaGlsZCAmJiBjaGlsZC5tdWx0aXBsZSB8fCBBcnJheS5pc0FycmF5KG1lbWJlcikpIHtcbiAgICAgICAgdmFyIGwgPSBtZW1iZXIubGVuZ3RoXG4gICAgICAgIHdoaWxlIChsLS0pIHtcbiAgICAgICAgICBpZiAobWVtYmVyW2xdLmVsZW1lbnQgPT0gZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIG1lbWJlcltsXVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtZW1iZXJcbiAgICB9LFxuICAgIGZpbmRDaGlsZDogZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICB2YXIgY2hpbGRcbiAgICAgIGlmICh0eXBlb2YgcHJvcGVydHkgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICBjaGlsZCA9IHRoaXMuY2hpbGRyZW5bcHJvcGVydHldXG4gICAgICB9XG4gICAgICBlbHNlIGlmIChwcm9wZXJ0eSBpbnN0YW5jZW9mIFNlbGVjdG9yKSB7XG4gICAgICAgIGNoaWxkID0gcHJvcGVydHlcbiAgICAgIH1cblxuICAgICAgaWYgKGNoaWxkKSB7XG4gICAgICAgIHZhciBlbGVtZW50ID0gY2hpbGQuZnJvbSh0aGlzLmVsZW1lbnQsIHRoaXMuZWxlbWVudFNlbGVjdG9yKS5maW5kKClcbiAgICAgICAgaWYgKGVsZW1lbnQgJiYgY2hpbGQubG9va3VwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q2hpbGRWaWV3KGNoaWxkLmxvb2t1cCwgZWxlbWVudClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxlbWVudFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxufSlcbiJdfQ==
