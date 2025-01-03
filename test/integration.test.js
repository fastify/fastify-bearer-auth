'use strict'

const { test } = require('node:test')
const fastify = require('fastify')()
const plugin = require('../')

fastify.register(plugin, { keys: new Set(['123456']) })

fastify.get('/test', (_req, res) => {
  res.send({ hello: 'world' })
})

test('success route succeeds', async (t) => {
  t.plan(2)
  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
    headers: {
      authorization: 'Bearer 123456'
    }
  })
  t.assert.strictEqual(response.statusCode, 200)
  t.assert.deepStrictEqual(JSON.parse(response.body), { hello: 'world' })
})

test('invalid key route fails correctly', async (t) => {
  t.plan(2)
  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
    headers: {
      authorization: 'Bearer 987654'
    }
  })
  t.assert.strictEqual(response.statusCode, 401)
  t.assert.strictEqual(JSON.parse(response.body).error, 'invalid authorization header')
})

test('missing space between bearerType and key fails correctly', async (t) => {
  t.plan(2)
  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
    headers: {
      authorization: 'Bearer123456'
    }
  })
  t.assert.strictEqual(response.statusCode, 401)
  t.assert.strictEqual(JSON.parse(response.body).error, 'invalid authorization header')
})

test('missing header route fails correctly', async (t) => {
  t.plan(2)
  const response = await fastify.inject({ method: 'GET', url: '/test' })
  t.assert.strictEqual(response.statusCode, 401)
  t.assert.strictEqual(JSON.parse(response.body).error, 'missing authorization header')
})

test('integration with @fastify/auth', async () => {
  const fastify = require('fastify')()
  await fastify.register(plugin, { addHook: false, keys: new Set(['123456']) })
  fastify.decorate('allowAnonymous', function (request, _, done) {
    if (!request.headers.authorization) {
      return done()
    }
    return done(new Error('not anonymous'))
  })
  await fastify.register(require('@fastify/auth'))

  fastify.route({
    method: 'GET',
    url: '/anonymous',
    preHandler: fastify.auth([
      fastify.allowAnonymous,
      fastify.verifyBearerAuth
    ]),
    handler: function (_, reply) {
      reply.send({ hello: 'world' })
    }
  })

  await fastify.ready()

  await test('anonymous should pass', async (t) => {
    t.plan(2)
    const res = await fastify.inject({ method: 'GET', url: '/anonymous' })
    t.assert.strictEqual(res.statusCode, 200)
    t.assert.strictEqual(JSON.parse(res.body).hello, 'world')
  })

  await test('bearer auth should pass', async (t) => {
    t.plan(2)
    const res = await fastify.inject({
      method: 'GET',
      url: '/anonymous',
      headers: {
        authorization: 'Bearer 123456'
      }
    })
    t.assert.strictEqual(res.statusCode, 200)
    t.assert.strictEqual(JSON.parse(res.body).hello, 'world')
  })

  await test('bearer auth should fail, so fastify.auth fails', async (t) => {
    t.plan(2)
    const res = await fastify.inject({
      method: 'GET',
      url: '/anonymous',
      headers: {
        authorization: 'Bearer fail'
      }
    })
    t.assert.strictEqual(res.statusCode, 401)
    t.assert.strictEqual(JSON.parse(res.body).error, 'Unauthorized')
  })
})

test('integration with @fastify/auth; not the last auth option', async () => {
  const fastify = require('fastify')()
  await fastify.register(plugin, { addHook: false, keys: new Set(['123456']) })
  fastify.decorate('alwaysValidAuth', function (_request, _, done) {
    return done()
  })
  await fastify.register(require('@fastify/auth'))

  fastify.route({
    method: 'GET',
    url: '/bearer-first',
    preHandler: fastify.auth([
      fastify.verifyBearerAuth,
      fastify.alwaysValidAuth
    ]),
    handler: function (_, reply) {
      reply.send({ hello: 'world' })
    }
  })

  await fastify.ready()

  await test('bearer auth should pass so fastify.auth should pass', async (t) => {
    t.plan(2)
    const res = await fastify.inject({
      method: 'GET',
      url: '/bearer-first',
      headers: {
        authorization: 'Bearer 123456'
      }
    })
    t.assert.strictEqual(res.statusCode, 200)
    t.assert.strictEqual(JSON.parse(res.body).hello, 'world')
  })

  await test('bearer should fail but fastify.auth should pass', async (t) => {
    t.plan(2)
    const res = await fastify.inject({
      method: 'GET',
      url: '/bearer-first',
      headers: {
        authorization: 'Bearer fail'
      }
    })
    t.assert.strictEqual(res.statusCode, 200)
    t.assert.strictEqual(JSON.parse(res.body).hello, 'world')
  })

  await test('bearer should fail but fastify.auth should pass', async (t) => {
    t.plan(2)
    const res = await fastify.inject({
      method: 'GET',
      url: '/bearer-first',
      headers: {}
    })
    t.assert.strictEqual(res.statusCode, 200)
    t.assert.strictEqual(JSON.parse(res.body).hello, 'world')
  })
})
