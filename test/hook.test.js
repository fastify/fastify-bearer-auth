'use strict'

const test = require('tap').test
const noop = () => {}
const plugin = require('../').internals.factory
const key = '123456789012354579814'
const keys = {keys: new Set([key])}

test('hook rejects for missing header', (t) => {
  t.plan(2)

  const request = {
    log: {error: noop},
    req: {headers: {}}
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
    log: {error: noop},
    req: {
      headers: {authorization: key}
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
    log: {error: noop},
    req: {
      headers: {authorization: `bearerr ${key}`}
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
    log: {error: noop},
    req: {
      headers: {authorization: `bearer ${key}`}
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

test('hook accepts correct header with extra padding', (t) => {
  t.plan(1)

  const request = {
    log: {error: noop},
    req: {
      headers: {authorization: `bearer   ${key}   `}
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
