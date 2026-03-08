'use strict'

const compare = require('./compare')

/**
 * @description Authenticates a key against a list of allowed key.
 * @param {Buffer[]} keys - An array of allowed keys as Buffers.
 * @param {string} key - The key to authenticate.
 * @returns {boolean} `true` if the key matches any of the allowed keys, `false` otherwise.
 */
module.exports = function authenticate (keys, key) {
  const b = Buffer.from(key)
  return keys.findIndex((a) => compare(a, b)) !== -1
}
