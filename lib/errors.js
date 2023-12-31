'use strict'

const createError = require('@fastify/error')

const FST_BEARER_AUTH_INVALID_LOG_LEVEL = createError('FST_BEARER_AUTH_INVALID_LOG_LEVEL', 'fastify.log does not have level \'%s\'')

module.exports = {
  FST_BEARER_AUTH_INVALID_LOG_LEVEL
}
