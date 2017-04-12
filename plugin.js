'use strict'

module.exports = function (options) {
  const defaultOptions = {
    keys: new Set(),
    errorResponse (err) {
      return {error: err.message}
    },
    contentType: undefined
  }
  const _options = Object.assign(defaultOptions, options || {})
  const keys = _options.keys
  const errorResponse = _options.errorResponse
  const contentType = _options.contentType

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
