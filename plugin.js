'use strict'

const crypto = require('crypto')
const fp = require('fastify-plugin')

function factory (options) {
  const defaultOptions = {
    keys: [],
    auth: undefined,
    errorResponse (err) {
      return { error: err.message }
    },
    contentType: undefined,
    bearerType: 'Bearer'
  }
  const _options = Object.assign({}, defaultOptions, options || {})
  if (_options.keys instanceof Set) _options.keys = Array.from(_options.keys)
  const { keys, errorResponse, contentType, bearerType, auth } = _options

  function bearerAuthHook (fastifyReq, fastifyRes, next) {
    const header = fastifyReq.req.headers.authorization
    if (!header) {
      const noHeaderError = Error('missing authorization header')
      fastifyReq.log.error('unauthorized: %s', noHeaderError.message)
      if (contentType) fastifyRes.header('content-type', contentType)
      fastifyRes.code(401).send(errorResponse(noHeaderError))
      return
    }

    const key = header.substring(bearerType.length).trim()
    let retVal
    // check if auth function is defined
    if (auth && auth instanceof Function) {
      try {
        retVal = auth(key, fastifyReq)
      // catch any error from the user provided function
      } catch (err) {
        retVal = Promise.reject(err)
      }
    } else {
    // if auth is not defined use keys
      retVal = authenticate(keys, key)
    }

    const invalidKeyError = Error('invalid authorization header')

    // retVal contains the result of the auth function if defined or the
    // result of the key comparison.
    // retVal is enclosed in a Promise.resolve to allow auth to be a normal
    // function or an async funtion. If it returns a non-promise value it
    // will be converted to a resolving promise. If it returns a promise it
    // will be resolved.
    Promise.resolve(retVal).then((val) => {
      // if val is not truthy return 401
      if (val === false) {
        fastifyReq.log.error('invalid authorization header: `%s`', header)
        if (contentType) fastifyRes.header('content-type', contentType)
        fastifyRes.code(401).send(errorResponse(invalidKeyError))
        return
      }
      if (val === true) {
        // if it fails down stream return the proper error
        try {
          next()
        } catch (err) {
          next(err)
        }
        return
      }
      fastifyRes.code(500).send(errorResponse(new Error('internal server error')))
    }).catch((err) => {
      fastifyRes.code(500).send(errorResponse(err instanceof Error ? err : Error(String(err))))
    })
  }

  return bearerAuthHook
}

function authenticate (keys, key) {
  return keys.findIndex((a) => compare(a, key)) !== -1
}

// perform constant-time comparison to prevent timing attacks
function compare (a, b) {
  try {
    // may throw if they have different length, can't convert to Buffer, etc...
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch {
    return false
  }
}

function plugin (fastify, options, next) {
  fastify.addHook('onRequest', factory(options))
  next()
}

module.exports = fp(plugin, {
  fastify: '3.x',
  name: 'fastify-bearer-auth'
})
module.exports.internals = { factory }
