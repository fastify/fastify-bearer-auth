'use strict'

const fp = require('fastify-plugin')
const compare = require('secure-compare')

function factory (options) {
  const defaultOptions = {
    keys: [],
    auth: undefined,
    failSilent: true,
    errorResponse (err) {
      return { error: err.message }
    },
    contentType: undefined,
    bearerType: 'Bearer'
  }
  const _options = Object.assign({}, defaultOptions, options || {})
  if (_options.keys instanceof Set) _options.keys = Array.from(_options.keys)
  const { keys, errorResponse, contentType, bearerType, auth, failSilent } = _options

  function bearerAuthHook (fastifyReq, fastifyRes, next) {
    const header = fastifyReq.req.headers['authorization']
    if (!header) {
      const noHeaderError = Error('missing authorization header')
      fastifyReq.log.error('unauthorized: %s', noHeaderError.message)
      if (contentType) fastifyRes.header('content-type', contentType)
      fastifyRes.code(401).send(errorResponse(noHeaderError))
      return
    }

    const key = header.substring(bearerType.length).trim()
    let retVal
    if (auth && auth instanceof Function) {
      try {
        retVal = auth(key)
      } catch (err) {
        retVal = Promise.reject(err)
      }
    } else {
      retVal = authenticate(keys, key)
    }

    const invalidKeyError = Error('invalid authorization header')
    Promise.resolve(retVal).then((val) => {
      if (!val) {
        fastifyReq.log.error('invalid authorization header: `%s`', header)
        if (contentType) fastifyRes.header('content-type', contentType)
        fastifyRes.code(401).send(errorResponse(invalidKeyError))
        return
      }
      next()
    }).catch((err) => {
      if (failSilent) {
        fastifyRes.code(401).send(errorResponse(invalidKeyError))
      } else {
        fastifyRes.code(500).send(errorResponse(err instanceof Error ? err : Error(String(err))))
      }
    })
  }

  return bearerAuthHook
}

function authenticate (keys, key) {
  return keys.find((a) => compare(a, key))
}

function plugin (fastify, options, next) {
  fastify.addHook('onRequest', factory(options))
  next()
}

module.exports = fp(plugin, {
  fastify: '^2.0.0',
  name: 'fastify-bearer-auth'
})
module.exports.internals = { factory }
