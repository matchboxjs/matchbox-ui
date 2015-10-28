var define = require("matchbox-util/object/define")
var defaults = require("matchbox-util/object/defaults")
var forIn = require("matchbox-util/object/in")
var factory = require("matchbox-factory")
var PrototypeExtension = require("matchbox-factory/PrototypeExtension")
var InstanceExtension = require("matchbox-factory/InstanceExtension")
var CacheExtension = require("matchbox-factory/CacheExtension")
var Attribute = require("matchbox-attributes/Attribute")
var domAttributes = require("matchbox-dom/attributes")
var Radio = require("matchbox-radio")
var Event = require("./Event")
var Modifier = require("./Modifier")

var View = module.exports = factory({
  'static': {},

  include: [Radio],

  extensions: {
    layouts: new CacheExtension(function (prototype, name, layoutHandler) {
      return layoutHandler
    }),
    events: new InstanceExtension(function (view, name, event) {
      if (!(event instanceof Event)) {
        event = new Event(event)
      }
      if (typeof event.handler == "string" && typeof view[event.handler] == "function") {
        event.handler = view[event.handler].bind(view)
      }
      //event.register(view.element, view)
      view._events[name] = event
    }),
    //attributes: new InstanceExtension(function (view, name, attribute) {
    //  if (!(attribute instanceof Attribute)) {
    //    attribute = domAttributes.create(attribute)
    //  }
    //
    //  attribute.name = attribute.name || name
    //  attribute.defineProperty(view.data, name, function () {
    //    return view.element
    //  })
    //}),
    attributes: new CacheExtension(function (prototype, name, attribute) {
      if (!(attribute instanceof Attribute)) {
        attribute = domAttributes.create(attribute)
      }

      attribute.name = attribute.name || name
      attribute.defineProperty(prototype, name, function (view) {
        return view.element
      })
      return attribute
    }),
    modifiers: new InstanceExtension(function (view, name, modifier) {
      if (!(modifier instanceof Modifier)) {
        modifier = new Modifier(modifier)
      }
      view._modifiers[name] = modifier
      //define.accessor(view.modifiers, name, function getter () {
      //  return modifier.get()
      //}, function setter (value) {
      //  modifier.set(value, view.element, view)
      //})
    }),
    //modifiers: new PrototypeExtension(function (prototype, name, modifier) {
    //  define.accessor(prototype, name, function getter () {
    //    var mod = this._modifiers[name]
    //    if (!mod) {
    //      mod = this._modifiers[name] = new Modifier(modifier)
    //    }
    //    return mod.get()
    //  }, function setter (value) {
    //    if (!this.element) {
    //      return
    //    }
    //
    //    var mod = this._modifiers[name]
    //    if (!mod) {
    //      mod = this._modifiers[name] = new Modifier(modifier)
    //    }
    //    mod.set(value, this.element, this)
    //  })
    //})
  },

  layouts: {},
  events: {},
  attributes: {},
  modifiers: {},

  constructor: function View( element ){
    Radio.call(this)
    define.value(this, "_events", {})
    define.value(this, "_modifiers", {})
    //define.value(this, "modifiers", {})
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
    }
  },

  prototype: {
    onElementChange: function (element, previous) {
      var view = this
      forIn(this._events, function (name, event) {
        if (previous) event.unRegister(previous)
        if (element) event.register(element, view)
      })
      forIn(this._modifiers, function (name, modifier) {
        modifier.reset(element, view)
      })
      forIn(this.attributes, function (name, attribute) {
        if (!element.hasAttribute(attribute.prefixedName) && attribute.default != null) {
          view[name] = attribute.default
        }
      })
    },
    onLayoutChange: function (layout, previous) {},
    changeLayout: function( layout ){
      if (this.currentLayout == layout) {
        return Promise.resolve()
      }

      var layoutHandler = this.layouts[layout]
      if (!layoutHandler) return Promise.reject(new Error("Missing layout handler: " + layout))

      var view = this
      var previous = view.currentLayout
      return Promise.resolve(previous).then(function () {
        return layoutHandler.call(view, previous)
      }).then(function () {
        view.currentLayout = layout
        view.onLayoutChange(layout, previous)
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
    }
  }
})
