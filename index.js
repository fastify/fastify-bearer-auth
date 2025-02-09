'use strict'

const fp = require('fastify-plugin')
const verifyBearerAuthFactory = require('./lib/verify-bearer-auth-factory')
const { FST_BEARER_AUTH_INVALID_HOOK, FST_BEARER_AUTH_INVALID_LOG_LEVEL } = require('./lib/errors')

/**
 * Hook type limited to 'onRequest' and 'preParsing' to protect against DoS attacks.
 * @see {@link https://github.com/fastify/fastify-auth?tab=readme-ov-file#hook-selection | fastify-auth hook selection}
 */
const validHooks = new Set(['onRequest', 'preParsing'])

function fastifyBearerAuth (fastify, options, done) {
  options = { verifyErrorLogLevel: 'error', ...options }
  if (options.addHook === true || options.addHook == null) {
    options.addHook = 'onRequest'
  }

  if (
    Object.hasOwn(fastify.log, 'error') === false ||
    typeof fastify.log.error !== 'function'
  ) {
    options.verifyErrorLogLevel = null
  }

  if (
    options.verifyErrorLogLevel != null &&
    (
      typeof options.verifyErrorLogLevel !== 'string' ||
      Object.hasOwn(fastify.log, options.verifyErrorLogLevel) === false ||
      typeof fastify.log[options.verifyErrorLogLevel] !== 'function'
    )
  ) {
    done(new FST_BEARER_AUTH_INVALID_LOG_LEVEL(options.verifyErrorLogLevel))
  }

  try {
    if (options.addHook) {
      if (!validHooks.has(options.addHook)) {
        done(new FST_BEARER_AUTH_INVALID_HOOK())
      }

      if (options.addHook === 'preParsing') {
        const verifyBearerAuth = verifyBearerAuthFactory(options)
        fastify.addHook('preParsing', (request, reply, _payload, done) => {
          verifyBearerAuth(request, reply, done)
        })
      } else {
        fastify.addHook(options.addHook, verifyBearerAuthFactory(options))
      }
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
  fastify: '5.x',
  name: '@fastify/bearer-auth'
})
module.exports.default = fastifyBearerAuth
module.exports.fastifyBearerAuth = fastifyBearerAuth
