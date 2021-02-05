'use strict'

const tap = require('tap')
const test = tap.test
const fastify = require('fastify')()
const plugin = require('../')

fastify.register(async function authenticatedContext (childServer) {
  childServer.register(plugin, { keys: new Set(['123456']), allowAnonymous: false })

  childServer.get('/authenticated/default', (req, res) => {
    res.send({ hello: 'world' })
  })

  childServer.get('/authenticated/override', { config: { allowAnonymous: true } }, (req, res) => {
    res.send({ hello: 'world' })
  })
})

fastify.register(async function allowAnonymousContext (childServer) {
  childServer.register(plugin, { keys: new Set(['123456']), allowAnonymous: true })

  childServer.get('/allowAnonymous/default', (req, res) => {
    res.send({ hello: 'world' })
  })

  childServer.get('/allowAnonymous/override', { config: { allowAnonymous: false } }, (req, res) => {
    res.send({ hello: 'world' })
  })
})

test('authenticated: missing header fails', (t) => {
  t.plan(2)
  fastify.inject({ method: 'GET', url: '/authenticated/default' }).then(response => {
    t.strictEqual(response.statusCode, 401)
    t.match(JSON.parse(response.body).error, /missing authorization header/)
  }).catch(err => {
    t.error(err)
  })
})

test('authenticated: override', (t) => {
  t.plan(2)
  fastify.inject({ method: 'GET', url: '/authenticated/override' }).then(response => {
    t.strictEqual(response.statusCode, 200)
    t.deepEqual(JSON.parse(response.body), { hello: 'world' })
  }).catch(err => {
    t.error(err)
  })
})

test('allowAnonymous: missing header succeeds', (t) => {
  t.plan(2)
  fastify.inject({ method: 'GET', url: '/allowAnonymous/default' }).then(response => {
    t.strictEqual(response.statusCode, 200)
    t.deepEqual(JSON.parse(response.body), { hello: 'world' })
  }).catch(err => {
    t.error(err)
  })
})

test('allowAnonymous: override', (t) => {
  t.plan(2)
  fastify.inject({ method: 'GET', url: '/allowAnonymous/override' }).then(response => {
    t.strictEqual(response.statusCode, 401)
    t.match(JSON.parse(response.body).error, /missing authorization header/)
  }).catch(err => {
    t.error(err)
  })
})
