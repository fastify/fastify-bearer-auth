'use strict'

const test = require('tap').test
const noop = () => { }
const verifyBearerAuthFactory = require('../lib/verify-bearer-auth-factory')
const key = '123456789012354579814'
const keys = { keys: new Set([key]) }

test('hook rejects for missing header', (t) => {
  t.plan(2)

  const request = {
    log: { error: noop },
    raw: { headers: {} }
  }
  const response = {
    code: () => response,
    send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /missing authorization header/)
  }

  const hook = verifyBearerAuthFactory()
  hook(request, response)
})

test('hook rejects for missing header with custom content type', (t) => {
  t.plan(6)

  const CUSTOM_CONTENT_TYPE = 'text/fastify'
  const request = {
    log: { error: noop },
    raw: { headers: {} }
  }
  const response = {
    code: () => response,
    header,
    send
  }
  function header (key, value) {
    t.ok(key)
    t.ok(value)
    t.equal(key, 'content-type')
    t.equal(value, CUSTOM_CONTENT_TYPE)
  }
  function send (body) {
    t.ok(body.error)
    t.match(body.error, /missing authorization header/)
  }

  const hook = verifyBearerAuthFactory({ contentType: CUSTOM_CONTENT_TYPE })
  hook(request, response)
})

test('hook rejects for wrong bearer type but same string length as `bearer`', (t) => {
  t.plan(2)

  const request = {
    log: { error: noop },
    raw: { headers: { authorization: `reraeB ${key}` } }
  }
  const response = {
    code: () => response,
    send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /invalid authorization header/)
  }

  const hook = verifyBearerAuthFactory()
  hook(request, response)
})

test('hook rejects for wrong bearer type', (t) => {
  t.plan(2)

  const request = {
    log: { error: noop },
    raw: { headers: { authorization: `fake-bearer ${key}` } }
  }
  const response = {
    code: () => response,
    send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /invalid authorization header/)
  }

  const hook = verifyBearerAuthFactory()
  hook(request, response)
})

test('hook rejects for wrong alternate Bearer', (t) => {
  t.plan(2)

  const bearerAlt = 'BearerAlt'
  const keysAlt = { keys: new Set([key]), bearerType: bearerAlt }
  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: `tlAreraeB ${key}` }
    }
  }
  const response = {
    code: () => response,
    send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /invalid authorization header/)
  }

  const hook = verifyBearerAuthFactory(keysAlt)
  hook(request, response)
})

test('hook rejects header without bearer prefix', (t) => {
  t.plan(2)

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: key }
    }
  }
  const response = {
    code: () => response,
    send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /invalid authorization header/)
  }

  const hook = verifyBearerAuthFactory(keys)
  hook(request, response)
})

test('hook rejects malformed header', (t) => {
  t.plan(2)

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: `bearerr ${key}` }
    }
  }
  const response = {
    code: () => response,
    send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /invalid authorization header/)
  }

  const hook = verifyBearerAuthFactory(keys)
  hook(request, response)
})

test('hook accepts correct header', (t) => {
  t.plan(1)

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: `Bearer ${key}` }
    }
  }
  const response = {
    code: () => response,
    send
  }

  function send (body) {
    t.fail('should not happen')
  }

  const hook = verifyBearerAuthFactory(keys)
  hook(request, response, () => {
    t.pass()
  })
})

test('hook accepts correct header and alternate Bearer', (t) => {
  t.plan(1)

  const bearerAlt = 'BearerAlt'
  const keysAlt = { keys: new Set([key]), bearerType: bearerAlt }
  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: `BearerAlt ${key}` }
    }
  }
  const response = {
    code: () => response,
    send
  }

  function send (body) {
    t.fail('should not happen')
  }

  const hook = verifyBearerAuthFactory(keysAlt)
  hook(request, response, () => {
    t.pass()
  })
})

test('hook throws if header misses at least one space after bearerType', (t) => {
  t.plan(2)

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: `Bearer${key}` }
    }
  }
  const response = {
    code: () => response,
    send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /invalid authorization header/)
  }

  const hook = verifyBearerAuthFactory(keys)
  hook(request, response)
})

test('hook accepts correct header with extra padding', (t) => {
  t.plan(1)

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: `Bearer   ${key}   ` }
    }
  }
  const response = {
    code: () => response,
    send
  }

  function send (body) {
    t.fail('should not happen')
  }

  const hook = verifyBearerAuthFactory(keys)
  hook(request, response, () => {
    t.pass()
  })
})

test('hook accepts correct header with auth function (promise)', (t) => {
  t.plan(2)
  const auth = function (val) {
    t.equal(val, key, 'wrong argument')
    return Promise.resolve(true)
  }
  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: `Bearer ${key}` }
    }
  }
  const response = {
    code: () => response,
    send
  }

  function send (body) {
    t.fail('should not happen')
  }

  const hook = verifyBearerAuthFactory({ auth })
  hook(request, response, () => {
    t.pass()
  })
})

test('hook accepts correct header with auth function (non-promise)', (t) => {
  t.plan(2)
  const auth = function (val) {
    t.equal(val, key, 'wrong argument')
    return true
  }
  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: `Bearer ${key}` }
    }
  }
  const response = {
    code: () => response,
    send
  }

  function send (body) {
    t.fail('should not happen')
  }

  const hook = verifyBearerAuthFactory({ auth })
  hook(request, response, () => {
    t.pass()
  })
})

test('hook rejects wrong token with keys', (t) => {
  t.plan(2)

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: 'Bearer abcdedfg' }
    }
  }
  const response = {
    code: () => response,
    send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /invalid authorization header/)
  }

  const hook = verifyBearerAuthFactory(keys)
  hook(request, response, () => {
    t.fail('should not accept')
  })
})

test('hook rejects wrong token with custom content type', (t) => {
  t.plan(6)

  const CUSTOM_CONTENT_TYPE = 'text/fastify'
  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: 'Bearer abcdefg' }
    }
  }
  const response = {
    code: () => response,
    header,
    send
  }
  function header (key, value) {
    t.ok(key)
    t.ok(value)
    t.equal(key, 'content-type')
    t.equal(value, CUSTOM_CONTENT_TYPE)
  }
  function send (body) {
    t.ok(body.error)
    t.match(body.error, /invalid authorization header/)
  }

  const hook = verifyBearerAuthFactory({ ...keys, contentType: CUSTOM_CONTENT_TYPE })
  hook(request, response)
})

test('hook rejects wrong token with auth function', (t) => {
  t.plan(5)

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: 'Bearer abcdefg' }
    }
  }

  const auth = function (val, req) {
    t.equal(req, request)
    t.equal(val, 'abcdefg', 'wrong argument')
    return false
  }

  const response = {
    code: (status) => {
      t.equal(401, status)
      return response
    },
    send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /invalid authorization header/)
  }

  const hook = verifyBearerAuthFactory({ auth })
  hook(request, response, () => {
    t.fail('should not accept')
  })
})

test('hook rejects wrong token with function (resolved promise)', (t) => {
  t.plan(4)

  const auth = function (val) {
    t.equal(val, 'abcdefg', 'wrong argument')
    return Promise.resolve(false)
  }

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: 'Bearer abcdefg' }
    }
  }
  const response = {
    code: (status) => {
      t.equal(401, status)
      return response
    },
    send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /invalid authorization header/)
  }

  const hook = verifyBearerAuthFactory({ auth })
  hook(request, response, () => {
    t.fail('should not accept')
  })
})

test('hook rejects with 500 when functions fails', (t) => {
  t.plan(4)

  const auth = function (val) {
    t.equal(val, 'abcdefg', 'wrong argument')
    throw Error('failing')
  }

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: 'Bearer abcdefg' }
    }
  }
  const response = {
    code: (status) => {
      t.equal(500, status)
      return response
    },
    send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /failing/)
  }

  const hook = verifyBearerAuthFactory({ auth })
  hook(request, response, () => {
    t.fail('should not accept')
  })
})

test('hook rejects with 500 when promise rejects', (t) => {
  t.plan(4)

  const auth = function (val) {
    t.equal(val, 'abcdefg', 'wrong argument')
    return Promise.reject(Error('failing'))
  }

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: 'Bearer abcdefg' }
    }
  }
  const response = {
    code: (status) => {
      t.equal(500, status)
      return response
    },
    send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /failing/)
  }

  const hook = verifyBearerAuthFactory({ auth })
  hook(request, response, () => {
    t.fail('should not accept')
  })
})

test('hook rejects with 500 when promise rejects with non Error', (t) => {
  t.plan(4)

  const auth = function (val) {
    t.equal(val, 'abcdefg', 'wrong argument')
    return Promise.reject('failing') // eslint-disable-line
  }

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: 'Bearer abcdefg' }
    }
  }
  const response = {
    code: (status) => {
      t.equal(500, status)
      return response
    },
    send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /failing/)
  }

  const hook = verifyBearerAuthFactory({ auth })
  hook(request, response, () => {
    t.fail('should not accept')
  })
})

test('hook returns proper error for valid key but failing callback', (t) => {
  t.plan(4)

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: `Bearer ${key}` }
    }
  }
  const response = {
    code: (status) => {
      t.equal(500, status)
      return response
    },
    send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /foo!/)
  }

  const hook = verifyBearerAuthFactory(keys)
  hook(request, response, (err) => {
    if (err) {
      t.pass(err)
    }
    throw new Error('foo!')
  })
})

test('hook rejects with 500 when functions returns non-boolean', (t) => {
  t.plan(4)

  const auth = function (val) {
    t.equal(val, 'abcdefg', 'wrong argument')
    return 'foobar'
  }

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: 'Bearer abcdefg' }
    }
  }
  const response = {
    code: (status) => {
      t.equal(500, status)
      return response
    },
    send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /internal server error/)
  }

  const hook = verifyBearerAuthFactory({ auth })
  hook(request, response, () => {
    t.fail('should not accept')
  })
})

test('hook rejects with 500 when promise resolves to non-boolean', (t) => {
  t.plan(4)

  const auth = function (val) {
    t.equal(val, 'abcdefg', 'wrong argument')
    return Promise.resolve('abcde')
  }

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: 'Bearer abcdefg' }
    }
  }
  const response = {
    code: (status) => {
      t.equal(500, status)
      return response
    },
    send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /internal server error/)
  }

  const hook = verifyBearerAuthFactory({ auth })
  hook(request, response, () => {
    t.fail('should not accept')
  })
})

test('hook rejects with 500 when functions returns non-boolean (addHook: false)', (t) => {
  t.plan(4)

  const auth = function (val) {
    t.equal(val, 'abcdefg', 'wrong argument')
    return 'foobar'
  }

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: 'Bearer abcdefg' }
    }
  }
  const response = {
    code: (status) => {
      t.equal(500, status)
      return response
    }
  }

  const hook = verifyBearerAuthFactory({ auth, addHook: false })
  hook(request, response, (err) => {
    t.ok(err)
    t.match(err.message, /internal server error/)
  })
})

test('hook rejects with 500 when promise rejects (addHook: false)', (t) => {
  t.plan(4)

  const auth = function (val) {
    t.equal(val, 'abcdefg', 'wrong argument')
    return Promise.reject(Error('failing'))
  }

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: 'Bearer abcdefg' }
    }
  }
  const response = {
    code: (status) => {
      t.equal(500, status)
      return response
    }
  }

  const hook = verifyBearerAuthFactory({ auth, addHook: false })
  hook(request, response, (err) => {
    t.ok(err)
    t.match(err.message, /failing/)
  })
})

test('options.keys can be an Array', (t) => {
  t.plan(1)

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: `Bearer ${key}` }
    }
  }
  const response = {
    code: () => response,
    send
  }

  function send (body) {
    t.fail('should not happen')
  }

  const hook = verifyBearerAuthFactory({ keys: [key] })
  hook(request, response, () => {
    t.pass()
  })
})

test('options.keys throws if not an Array and not a Set', (t) => {
  t.plan(1)

  t.throws(() => verifyBearerAuthFactory({ keys: true }))
})
