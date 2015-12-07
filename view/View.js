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
