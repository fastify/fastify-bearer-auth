'use strict'

const compare = require('./compare')

module.exports = function authenticate (keys, key) {
  const b = Buffer.from(key)
  return keys.findIndex((a) => compare(a, b)) !== -1
}
