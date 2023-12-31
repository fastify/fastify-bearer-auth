'use strict'

const { createError } = require('@fastify/error')

const FST_BEARER_AUTH_INVALID_KEYS_OPTION_TYPE = createError('FST_BEARER_AUTH_INVALID_KEYS_OPTION_TYPE', 'options.keys has to be an Array or a Set')
const FST_BEARER_AUTH_KEYS_OPTION_INVALID_KEY_TYPE = createError('FST_BEARER_AUTH_KEYS_OPTION_INVALID_KEY_TYPE', 'options.keys has to contain only string entries')

module.exports = {
  FST_BEARER_AUTH_INVALID_KEYS_OPTION_TYPE,
  FST_BEARER_AUTH_KEYS_OPTION_INVALID_KEY_TYPE
}
