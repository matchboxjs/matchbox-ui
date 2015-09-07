var core = require("matchbox-core")
var attributor = require("matchbox-attributes")
var delegate = require("matchbox-delegate")
var object = require("matchbox-util/object")
var defaults = require("matchbox-util/defaults")

var Widget = module.exports = core({
  inherit: null,
  include: [],
  augment: [],

  constructor: function( element ){
    this.element = element
  },

  static: {
    createSelector: function( attribute, value, operator, extra ){
      value = value && '"' + value + '"'
      operator = value ? operator || "=" : ""
      extra = extra || ""
      return "[" + attribute + operator + value + "]" + extra
    },
    createWidgetSelector: function( selector, extra ){
      return this.createSelector("widget", selector, "~=", extra)
    }
  },

  options: {
    attribute: function( Class, attributes ){
      var defineAttribute = attributor(Class, {
        camelCase: true,
        get: function( widget, name ){
          return widget.element.getAttribute(name)
        },
        set: function( widget, name, value ){
          return widget.element.setAttribute(name, value)
        },
        remove: function( widget, name ){
          return widget.element.removeAttribute(name)
        }
      })
      object.for(attributes, function( name, attribute ){
        defineAttribute(name, attribute)
      })
    }
  },

  accessor: {
    element: {
      get: function(){
        return this._element
      },
      set: function( element ){
        var old = this._element
        this._element = element
        this.onElement(element, old)
      }
    }
  },

  //attribute: {
  //  value: {type: "string"}
  //},

  prototype: {
    onElement: function(){},

    node: function( id, type ){
      var selector = id
      if( id[0] == ":" ) selector = this.__name + id

      var element = this.element.querySelector(selector)
      if( !type ) return element

      var Class = Widget.__registry.get(type)
      if( !Class ) throw new Error("Couldn't find widget '%s", type)

      return new Class(element)
    },
    nodeList: function( id, type ){
      var selector = id
      if( id[0] == ":" ) selector = this.__name + id

      var elements = [].slice.call(this.element.querySelectorAll(selector))
      if( !type ) return elements

      var Class = Widget.__registry.get(type)
      if( !Class ) throw new Error("Couldn't find widget '%s", type)

      return elements.map(function( element ){ return new Class(element) })
    },
    select: function( selector, criteria ){
      if( selector[0] == ":" ) selector = this.__name + selector

      var extra = ""
      for( var attribute in criteria ){
        if( criteria.hasOwnProperty(attribute) ){
          extra += Widget.createWidgetSelector(attribute, criteria[attribute])
        }
      }

      return this.element.querySelector(selector)
    },
    selectAll: function( selector, criteria ){
      if( selector[0] == ":" ) selector = this.__name + selector

      var extra = ""
      for( var attribute in criteria ){
        if( criteria.hasOwnProperty(attribute) ){
          extra += Widget.createWidgetSelector(attribute, criteria[attribute])
        }
      }

      return this.element.querySelectorAll(selector)
    },
    delegate: function( options ){
      options.element = this.element
      options.context = options.context || this
      return delegate(options)
    },
    action: function( event, node, callback ){
      var options = {}
      options.event = this.event
      options.element = this.element
      options.context = options.context || this

      var widgetName = this.name
      var selectors = Array.isArray(node) ? node : [node]
      selectors.unshift(widgetName)
      selectors = selectors.map(function( selector ){
        if( selector[0] == ":" ) selector = widgetName + selector
        return Widget.createWidgetSelector(selector)
      })

      return delegate(options).match(selectors, function( e/*, element, nodes...*/ ){
        var args = [e].concat([].slice.call(arguments, 2))
        callback.apply(this, args)
      })
    },
    event: function( type ){

    }
  }
})
