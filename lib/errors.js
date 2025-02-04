'use strict'

const { createError } = require('@fastify/error')

const FST_BEARER_AUTH_INVALID_KEYS_OPTION_TYPE = createError('FST_BEARER_AUTH_INVALID_KEYS_OPTION_TYPE', 'options.keys has to be an Array or a Set')
const FST_BEARER_AUTH_INVALID_HOOK = createError('FST_BEARER_AUTH_INVALID_HOOK', 'options.addHook must be either "onRequest" or "preParsing"')
const FST_BEARER_AUTH_INVALID_LOG_LEVEL = createError('FST_BEARER_AUTH_INVALID_LOG_LEVEL', 'fastify.log does not have level \'%s\'')
const FST_BEARER_AUTH_KEYS_OPTION_INVALID_KEY_TYPE = createError('FST_BEARER_AUTH_KEYS_OPTION_INVALID_KEY_TYPE', 'options.keys has to contain only string entries')
const FST_BEARER_AUTH_INVALID_SPEC = createError('FST_BEARER_AUTH_INVALID_SPEC', 'options.specCompliance has to be set to \'rfc6750\' or \'rfc6749\'')
const FST_BEARER_AUTH_MISSING_AUTHORIZATION_HEADER = createError('FST_BEARER_AUTH_MISSING_AUTHORIZATION_HEADER', 'missing authorization header', 401)
const FST_BEARER_AUTH_INVALID_AUTHORIZATION_HEADER = createError('FST_BEARER_AUTH_INVALID_AUTHORIZATION_HEADER', 'invalid authorization header', 401)

module.exports = {
  FST_BEARER_AUTH_INVALID_KEYS_OPTION_TYPE,
  FST_BEARER_AUTH_INVALID_HOOK,
  FST_BEARER_AUTH_INVALID_LOG_LEVEL,
  FST_BEARER_AUTH_KEYS_OPTION_INVALID_KEY_TYPE,
  FST_BEARER_AUTH_INVALID_SPEC,
  FST_BEARER_AUTH_MISSING_AUTHORIZATION_HEADER,
  FST_BEARER_AUTH_INVALID_AUTHORIZATION_HEADER
}
