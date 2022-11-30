'use strict'

const fp = require('fastify-plugin')
const verifyBearerAuthFactory = require('./lib/verifyBearerAuthFactory')

function fastifyBearerAuth (fastify, options, done) {
  const defaultLogLevel = 'error'
  options = Object.assign({ addHook: true, verifyErrorLogLevel: defaultLogLevel }, options)

  if (!Object.prototype.hasOwnProperty.call(fastify.log, 'error') ||
    (typeof fastify.log.error) !== 'function') options.verifyErrorLogLevel = null
  if (options.verifyErrorLogLevel != null &&
    (typeof options.verifyErrorLogLevel !== 'string' ||
      !Object.prototype.hasOwnProperty.call(fastify.log, options.verifyErrorLogLevel) ||
      (typeof fastify.log[options.verifyErrorLogLevel]) !== 'function'
    )) {
    const invalidLogLevelError = Error(`fastify.log does not have level '${options.verifyErrorLogLevel}'`)
    done(invalidLogLevelError)
  }

  if (options.addHook === true) {
    fastify.addHook('onRequest', verifyBearerAuthFactory(options))
  } else {
    fastify.decorate('verifyBearerAuthFactory', verifyBearerAuthFactory)
    fastify.decorate('verifyBearerAuth', verifyBearerAuthFactory(options))
  }

  done()
}

module.exports = fp(fastifyBearerAuth, {
  fastify: '4.x',
  name: '@fastify/bearer-auth'
})
module.exports.default = fastifyBearerAuth
module.exports.fastifyBearerAuth = fastifyBearerAuth
