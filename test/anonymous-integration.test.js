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

test('authenticated: missing header fails', async (t) => {
  t.plan(2)
  const response = await fastify.inject({ method: 'GET', url: '/authenticated/default' })
  t.strictEqual(response.statusCode, 401)
  t.match(JSON.parse(response.body).error, /missing authorization header/)
})

test('authenticated: override', async (t) => {
  t.plan(2)
  const response = await fastify.inject({ method: 'GET', url: '/authenticated/override' })
  t.strictEqual(response.statusCode, 200)
  t.deepEqual(JSON.parse(response.body), { hello: 'world' })
})

test('allowAnonymous: missing header succeeds', async (t) => {
  t.plan(2)
  const response = await fastify.inject({ method: 'GET', url: '/allowAnonymous/default' })
  t.strictEqual(response.statusCode, 200)
  t.deepEqual(JSON.parse(response.body), { hello: 'world' })
})

test('allowAnonymous: override', async (t) => {
  t.plan(2)
  const response = await fastify.inject({ method: 'GET', url: '/allowAnonymous/override' })
  t.strictEqual(response.statusCode, 401)
  t.match(JSON.parse(response.body).error, /missing authorization header/)
})
