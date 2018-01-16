'use strict'

const fp = require('fastify-plugin')

const internals = {}
internals.factory = function (options) {
  const defaultOptions = {
    keys: new Set(),
    errorResponse (err) {
      return {error: err.message}
    },
    contentType: undefined
  }
  const _options = Object.assign({}, defaultOptions, options || {})
  const {keys, errorResponse, contentType} = _options

  function bearerAuthHook (fastifyReq, fastifyRes, next) {
    const header = fastifyReq.req.headers['authorization']
    if (!header) {
      const noHeaderError = Error('missing authorization header')
      fastifyReq.log.error('unauthorized: %s', noHeaderError.message)
      if (contentType) fastifyRes.header('content-type', contentType)
      fastifyRes.code(401).send(errorResponse(noHeaderError))
      return
    }

    const key = header.substring(6).trim()
    if (keys.has(key) === false) {
      const invalidKeyError = Error('invalid authorization header')
      fastifyReq.log.error('invalid authorization header: `%s`', header)
      if (contentType) fastifyRes.header('content-type', contentType)
      fastifyRes.code(401).send(errorResponse(invalidKeyError))
      return
    }

    next()
  }

  return bearerAuthHook
}

function plugin (fastify, options, next) {
  const hook = internals.factory(options)
  fastify.addHook('preHandler', hook)
  next()
}

module.exports = fp(plugin, {
  fastify: '>=0.39.1',
  name: 'fastify-bearer-auth'
})
module.exports.internals = internals
