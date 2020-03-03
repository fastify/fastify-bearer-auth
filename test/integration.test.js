'use strict'

const tap = require('tap')
const test = tap.test
const fastify = require('fastify')()
const plugin = require('../')

fastify.register(plugin, { keys: new Set(['123456']) })

fastify.get('/test', (req, res) => {
  res.send({ hello: 'world' })
})

fastify.listen(0, (err) => {
  if (err) tap.error(err)
  fastify.server.unref()

  const baseUrl = 'http://localhost:' + fastify.server.address().port

  test('success route succeeds', (t) => {
    t.plan(2)
    fastify.inject({
      method: 'GET',
      url: baseUrl + '/test',
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
      url: baseUrl + '/test',
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
    fastify.inject({ method: 'GET', url: baseUrl + '/test' }).then(response => {
      t.strictEqual(response.statusCode, 401)
      t.match(JSON.parse(response.body).error, /missing authorization header/)
    }).catch(err => {
      t.error(err)
    })
  })
})
