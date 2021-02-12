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
    t.strictEqual(response.statusCode, 200)
    t.deepEqual(JSON.parse(response.body), { hello: 'world' })
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
    t.strictEqual(response.statusCode, 401)
    t.match(JSON.parse(response.body).error, /invalid authorization header/)
  }).catch(err => {
    t.error(err)
  })
})

test('missing header route fails correctly', (t) => {
  t.plan(2)
  fastify.inject({ method: 'GET', url: '/test' }).then(response => {
    t.strictEqual(response.statusCode, 401)
    t.match(JSON.parse(response.body).error, /missing authorization header/)
  }).catch(err => {
    t.error(err)
  })
})

test('integration with fastify-auth', async (t) => {
  t.plan(3)

  const fastify = require('fastify')()
  await fastify.register(plugin, { addHook: false, keys: new Set(['123456']) })
  await fastify.decorate('allowAnonymous', function (request, _, done) {
    if (!request.headers.authorization) {
      return done()
    }
    return done(new Error('not anonymous'))
  })
  await fastify.register(require('fastify-auth'))

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
    try {
      const res = await fastify.inject({ method: 'GET', url: '/anonymous' })
      t.strictEqual(res.statusCode, 200)
      t.match(JSON.parse(res.body).hello, 'world')
    } catch (err) {
      t.error(err)
    }
  })

  t.test('bearer auth should pass', async (t) => {
    t.plan(2)
    try {
      const res = await fastify.inject({
        method: 'GET',
        url: '/anonymous',
        headers: {
          authorization: 'Bearer 123456'
        }
      })
      t.strictEqual(res.statusCode, 200)
      t.match(JSON.parse(res.body).hello, 'world')
    } catch (err) {
      t.error(err)
    }
  })

  t.test('bearer auth should fail', async (t) => {
    t.plan(2)
    try {
      const res = await fastify.inject({
        method: 'GET',
        url: '/anonymous',
        headers: {
          authorization: 'Bearer fail'
        }
      })
      t.strictEqual(res.statusCode, 401)
      t.match(JSON.parse(res.body).error, /invalid authorization header/)
    } catch (err) {
      t.error(err)
    }
  })
})
