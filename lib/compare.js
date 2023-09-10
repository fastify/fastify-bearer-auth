'use strict'

const crypto = require('node:crypto')

// perform constant-time comparison to prevent timing attacks
module.exports = function compare (a, b) {
  if (a.length !== b.length) {
    // Delay return with cryptographically secure timing check.
    crypto.timingSafeEqual(a, a)
    return false
  }

  return crypto.timingSafeEqual(a, b)
}
