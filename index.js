'use strict'

const fp = require('fastify-plugin')
const verifyBearerAuthFactory = require('./lib/verify-bearer-auth-factory')
const { FST_BEARER_AUTH_INVALID_LOG_LEVEL } = require('./lib/errors')

function fastifyBearerAuth (fastify, options, done) {
  options = Object.assign({ addHook: true, verifyErrorLogLevel: 'error' }, options)

  if (
    Object.prototype.hasOwnProperty.call(fastify.log, 'error') === false ||
    typeof fastify.log.error !== 'function'
  ) {
    options.verifyErrorLogLevel = null
  }

  if (
    options.verifyErrorLogLevel != null &&
    (
      typeof options.verifyErrorLogLevel !== 'string' ||
      Object.prototype.hasOwnProperty.call(fastify.log, options.verifyErrorLogLevel) === false ||
      typeof fastify.log[options.verifyErrorLogLevel] !== 'function'
    )
  ) {
    done(new FST_BEARER_AUTH_INVALID_LOG_LEVEL(options.verifyErrorLogLevel))
  }

  try {
    if (options.addHook === true) {
      fastify.addHook('onRequest', verifyBearerAuthFactory(options))
    } else {
      fastify.decorate('verifyBearerAuthFactory', verifyBearerAuthFactory)
      fastify.decorate('verifyBearerAuth', verifyBearerAuthFactory(options))
    }
    done()
  } catch (err) {
    done(err)
  }
}

module.exports = fp(fastifyBearerAuth, {
  fastify: '4.x',
  name: '@fastify/bearer-auth'
})
module.exports.default = fastifyBearerAuth
module.exports.fastifyBearerAuth = fastifyBearerAuth
