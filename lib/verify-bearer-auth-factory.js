'use strict'

const authenticate = require('./authenticate')
const {
  FST_BEARER_AUTH_INVALID_KEYS_OPTION_TYPE,
  FST_BEARER_AUTH_KEYS_OPTION_INVALID_KEY_TYPE
} = require('./errors')

const defaultOptions = {
  keys: [],
  auth: undefined,
  errorResponse (err) {
    return { error: err.message }
  },
  contentType: undefined,
  bearerType: 'Bearer'
}

module.exports = function verifyBearerAuthFactory (options) {
  const _options = Object.assign({}, defaultOptions, options)
  if (_options.keys instanceof Set) {
    _options.keys = Array.from(_options.keys)
  } else if (Array.isArray(_options.keys)) {
    // create unique array of keys
    _options.keys = Array.from(new Set(_options.keys))
  } else {
    throw new FST_BEARER_AUTH_INVALID_KEYS_OPTION_TYPE()
  }

  const { keys, errorResponse, contentType, bearerType, auth, addHook = true, verifyErrorLogLevel = 'error' } = _options

  for (let i = 0, il = keys.length; i < il; ++i) {
    if (typeof keys[i] !== 'string') {
      throw new FST_BEARER_AUTH_KEYS_OPTION_INVALID_KEY_TYPE()
    }
    keys[i] = Buffer.from(keys[i])
  }

  const bearerTypePrefix = bearerType + ' '
  const bearerTypePrefixLength = bearerType.length + 1

  function handleUnauthorized (request, reply, done, message) {
    const noHeaderError = Error(message)
    if (verifyErrorLogLevel) request.log[verifyErrorLogLevel]('unauthorized: %s', noHeaderError.message)
    if (contentType) reply.header('content-type', contentType)
    reply.code(401)
    if (!addHook) {
      done(noHeaderError)
      return
    }
    reply.send(errorResponse(noHeaderError))
  }

  return function verifyBearerAuth (request, reply, done) {
    const authorizationHeader = request.raw.headers.authorization
    if (!authorizationHeader) {
      return handleUnauthorized(request, reply, done, 'missing authorization header')
    }

    if (authorizationHeader.substring(0, bearerTypePrefixLength) !== bearerTypePrefix) {
      return handleUnauthorized(request, reply, done, 'invalid authorization header')
    }

    const key = authorizationHeader.substring(bearerTypePrefixLength).trim()
    let retVal = false
    // check if auth function is defined
    if (auth && auth instanceof Function) {
      try {
        retVal = auth(key, request)
        // catch any error from the user provided function
      } catch (err) {
        retVal = Promise.reject(err)
      }
    } else {
      // if auth is not defined use keys
      retVal = authenticate(keys, key)
    }

    // retVal contains the result of the auth function if defined or the
    // result of the key comparison.
    // retVal is enclosed in a Promise.resolve to allow auth to be a normal
    // function or an async function. If it returns a non-promise value it
    // will be converted to a resolving promise. If it returns a promise it
    // will be resolved.
    Promise.resolve(retVal).then((val) => {
      // if val is not truthy return 401
      if (val === false) {
        handleUnauthorized(request, reply, done, 'invalid authorization header')
        return
      }
      if (val === true) {
        // if it fails down stream return the proper error
        try {
          done()
        } catch (err) {
          done(err)
        }
        return
      }
      const retErr = new Error('internal server error')
      reply.code(500)
      if (!addHook) return done(retErr)
      reply.send(errorResponse(retErr))
    }).catch((err) => {
      const retErr = err instanceof Error ? err : Error(String(err))
      reply.code(500)
      if (!addHook) return done(retErr)
      reply.send(errorResponse(retErr))
    })
  }
}
