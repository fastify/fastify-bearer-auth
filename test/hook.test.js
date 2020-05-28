'use strict'

const test = require('tap').test
const noop = () => {}
const plugin = require('../').internals.factory
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
    send: send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /missing authorization header/)
  }

  const hook = plugin()
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
    send: send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /invalid authorization header/)
  }

  const hook = plugin(keys)
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
    send: send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /invalid authorization header/)
  }

  const hook = plugin(keys)
  hook(request, response)
})

test('hook accepts correct header', (t) => {
  t.plan(1)

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: `bearer ${key}` }
    }
  }
  const response = {
    code: () => response,
    send: send
  }

  function send (body) {
    t.fail('should not happen')
  }

  const hook = plugin(keys)
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
    send: send
  }

  function send (body) {
    t.fail('should not happen')
  }

  const hook = plugin(keysAlt)
  hook(request, response, () => {
    t.pass()
  })
})

test('hook accepts correct header with extra padding', (t) => {
  t.plan(1)

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: `bearer   ${key}   ` }
    }
  }
  const response = {
    code: () => response,
    send: send
  }

  function send (body) {
    t.fail('should not happen')
  }

  const hook = plugin(keys)
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
      headers: { authorization: `bearer ${key}` }
    }
  }
  const response = {
    code: () => response,
    send: send
  }

  function send (body) {
    t.fail('should not happen')
  }

  const hook = plugin({ auth })
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
      headers: { authorization: `bearer ${key}` }
    }
  }
  const response = {
    code: () => response,
    send: send
  }

  function send (body) {
    t.fail('should not happen')
  }

  const hook = plugin({ auth })
  hook(request, response, () => {
    t.pass()
  })
})

test('hook rejects wrong token with keys', (t) => {
  t.plan(2)

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: 'bearer abcdedfg' }
    }
  }
  const response = {
    code: () => response,
    send: send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /invalid authorization header/)
  }

  const hook = plugin(keys)
  hook(request, response, () => {
    t.fail('should not accept')
  })
})

test('hook rejects wrong token with auth function', (t) => {
  t.plan(5)

  const request = {
    log: { error: noop },
    raw: {
      headers: { authorization: 'bearer abcdefg' }
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
    send: send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /invalid authorization header/)
  }

  const hook = plugin({ auth })
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
      headers: { authorization: 'bearer abcdefg' }
    }
  }
  const response = {
    code: (status) => {
      t.equal(401, status)
      return response
    },
    send: send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /invalid authorization header/)
  }

  const hook = plugin({ auth })
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
      headers: { authorization: 'bearer abcdefg' }
    }
  }
  const response = {
    code: (status) => {
      t.equal(500, status)
      return response
    },
    send: send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /failing/)
  }

  const hook = plugin({ auth })
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
      headers: { authorization: 'bearer abcdefg' }
    }
  }
  const response = {
    code: (status) => {
      t.equal(500, status)
      return response
    },
    send: send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /failing/)
  }

  const hook = plugin({ auth })
  hook(request, response, () => {
    t.fail('should not accept')
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
      headers: { authorization: 'bearer abcdefg' }
    }
  }
  const response = {
    code: (status) => {
      t.equal(500, status)
      return response
    },
    send: send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /internal server error/)
  }

  const hook = plugin({ auth })
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
      headers: { authorization: 'bearer abcdefg' }
    }
  }
  const response = {
    code: (status) => {
      t.equal(500, status)
      return response
    },
    send: send
  }

  function send (body) {
    t.ok(body.error)
    t.match(body.error, /internal server error/)
  }

  const hook = plugin({ auth })
  hook(request, response, () => {
    t.fail('should not accept')
  })
})
