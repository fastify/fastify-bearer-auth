'use strict'

const tap = require('tap')
const test = tap.test
const fastify = require('fastify')()
const plugin = require('../')

fastify.register(plugin, { keys: new Set(['123456']) })

fastify.get('/test', (req, res) => {
  res.send({ hello: 'world' })
})

test('success route succeeds', (t) => {
  t.plan(2)
  fastify.inject({
    method: 'GET',
    url: '/test',
    headers: {
      authorization: 'Bearer 123456'
    }
  }).then(response => {
    t.equal(response.statusCode, 200)
    t.same(JSON.parse(response.body), { hello: 'world' })
  }).catch(err => {
    t.error(err)
  })
})

test('invalid key route fails correctly', (t) => {
  t.plan(2)
  fastify.inject({
    method: 'GET',
    url: '/test',
    headers: {
      authorization: 'Bearer 987654'
    }
  }).then(response => {
    t.equal(response.statusCode, 401)
    t.match(JSON.parse(response.body).error, /invalid authorization header/)
  }).catch(err => {
    t.error(err)
  })
})

test('missing space between bearerType and key fails correctly', (t) => {
  t.plan(2)
  fastify.inject({
    method: 'GET',
    url: '/test',
    headers: {
      authorization: 'Bearer123456'
    }
  }).then(response => {
    t.equal(response.statusCode, 401)
    t.match(JSON.parse(response.body).error, /invalid authorization header/)
  }).catch(err => {
    t.error(err)
  })
})

test('missing header route fails correctly', (t) => {
  t.plan(2)
  fastify.inject({ method: 'GET', url: '/test' }).then(response => {
    t.equal(response.statusCode, 401)
    t.match(JSON.parse(response.body).error, /missing authorization header/)
  }).catch(err => {
    t.error(err)
  })
})

test('integration with @fastify/auth', async (t) => {
  t.plan(3)

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

  t.test('anonymous should pass', async (t) => {
    t.plan(2)
    const res = await fastify.inject({ method: 'GET', url: '/anonymous' })
    t.equal(res.statusCode, 200)
    t.match(JSON.parse(res.body).hello, 'world')
  })

  t.test('bearer auth should pass', async (t) => {
    t.plan(2)
    const res = await fastify.inject({
      method: 'GET',
      url: '/anonymous',
      headers: {
        authorization: 'Bearer 123456'
      }
    })
    t.equal(res.statusCode, 200)
    t.match(JSON.parse(res.body).hello, 'world')
  })

  t.test('bearer auth should fail, so fastify.auth fails', async (t) => {
    t.plan(2)
    const res = await fastify.inject({
      method: 'GET',
      url: '/anonymous',
      headers: {
        authorization: 'Bearer fail'
      }
    })
    t.equal(res.statusCode, 401)
    t.match(JSON.parse(res.body).error, /Unauthorized/)
  })
})

test('integration with @fastify/auth; not the last auth option', async (t) => {
  t.plan(3)

  const fastify = require('fastify')()
  await fastify.register(plugin, { addHook: false, keys: new Set(['123456']) })
  fastify.decorate('alwaysValidAuth', function (request, _, done) {
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

  t.test('bearer auth should pass so fastify.auth should pass', async (t) => {
    t.plan(2)
    const res = await fastify.inject({
      method: 'GET',
      url: '/bearer-first',
      headers: {
        authorization: 'Bearer 123456'
      }
    })
    t.equal(res.statusCode, 200)
    t.match(JSON.parse(res.body).hello, 'world')
  })

  t.test('bearer should fail but fastify.auth should pass', async (t) => {
    t.plan(2)
    const res = await fastify.inject({
      method: 'GET',
      url: '/bearer-first',
      headers: {
        authorization: 'Bearer fail'
      }
    })
    t.equal(res.statusCode, 200)
    t.match(JSON.parse(res.body).hello, 'world')
  })

  t.test('bearer should fail but fastify.auth should pass', async (t) => {
    t.plan(2)
    const res = await fastify.inject({
      method: 'GET',
      url: '/bearer-first',
      headers: {}
    })
    t.equal(res.statusCode, 200)
    t.match(JSON.parse(res.body).hello, 'world')
  })
})
