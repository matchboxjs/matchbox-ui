var inherit = require("matchbox-factory/inherit")
var Modifier = require("./Modifier")

module.exports = SwitchModifier

function SwitchModifier (defaultValue, on, off, animationDuration) {
  Modifier.call(this, {
    type: "switch",
    default: defaultValue,
    on: on,
    off: off,
    animationDuration: animationDuration
  })
}

inherit(SwitchModifier, Modifier)
