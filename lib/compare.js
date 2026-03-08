'use strict'

const { timingSafeEqual} = require('node:crypto')

/**
 * @description Compares two buffers in constant time to prevent timing attacks.
 * If the buffers have different lengths, a self-comparison is performed to ensure
 * consistent timing before returning `false`.
 * @param {Buffer} a - The first buffer to compare.
 * @param {Buffer} b - The second buffer to compare.
 * @returns {boolean} `true` if the buffers are equal, `false` otherwise.
 */
module.exports = function compare (a, b) {
  if (a.length !== b.length) {
    // Delay return with cryptographically secure timing check
    timingSafeEqual(a, a)
    return false
  }

  return timingSafeEqual(a, b)
}
