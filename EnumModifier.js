var inherit = require("matchbox-factory/inherit")
var Modifier = require("./Modifier")

module.exports = EnumModifier

function EnumModifier (defaultValue, values, animationDuration) {
  Modifier.call(this, {
    type: "enum",
    default: defaultValue,
    values: values,
    animationDuration: animationDuration
  })
}

inherit(EnumModifier, Modifier)
