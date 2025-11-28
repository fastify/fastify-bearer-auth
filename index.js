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
  const pluginOptions = { verifyErrorLogLevel: 'error', ...options }

  if (pluginOptions.addHook === true || pluginOptions.addHook == null) {
    pluginOptions.addHook = 'onRequest'
  }

  if (
    Object.hasOwn(fastify.log, 'error') === false ||
    typeof fastify.log.error !== 'function'
  ) {
    pluginOptions.verifyErrorLogLevel = null
  }

  if (
    pluginOptions.verifyErrorLogLevel != null &&
    (
      typeof pluginOptions.verifyErrorLogLevel !== 'string' ||
      Object.hasOwn(fastify.log, pluginOptions.verifyErrorLogLevel) === false ||
      typeof fastify.log[pluginOptions.verifyErrorLogLevel] !== 'function'
    )
  ) {
    done(new FST_BEARER_AUTH_INVALID_LOG_LEVEL(pluginOptions.verifyErrorLogLevel))
  }

  try {
    if (pluginOptions.addHook) {
      if (!validHooks.has(pluginOptions.addHook)) {
        done(new FST_BEARER_AUTH_INVALID_HOOK())
      }

      if (pluginOptions.addHook === 'preParsing') {
        const verifyBearerAuth = verifyBearerAuthFactory(pluginOptions)
        fastify.addHook('preParsing', (request, reply, _payload, done) => {
          verifyBearerAuth(request, reply, done)
        })
      } else {
        fastify.addHook(pluginOptions.addHook, verifyBearerAuthFactory(pluginOptions))
      }
    } else {
      fastify.decorate('verifyBearerAuthFactory', verifyBearerAuthFactory)
      fastify.decorate('verifyBearerAuth', verifyBearerAuthFactory(pluginOptions))
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
