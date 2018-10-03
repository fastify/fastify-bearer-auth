'use strict'

const tap = require('tap')
const test = tap.test
const fastify = require('fastify')()
const request = require('request')
const plugin = require('../')

fastify.register(plugin, { keys: new Set(['123456']) })

fastify.get('/test1', (req, res) => {
  res.send({ hello: 'world' })
})

fastify.get('/test2', (req, res) => {
  res.send({ hello: 'world' })
})

fastify.get('/test3', (req, res) => {
  res.send({ hello: 'world' })
})

fastify.listen(0, (err) => {
  if (err) tap.error(err)
  fastify.server.unref()

  const reqOpts = {
    method: 'GET',
    baseUrl: 'http://localhost:' + fastify.server.address().port
  }
  const req = request.defaults(reqOpts)

  test('success route succeeds', (t) => {
    t.plan(3)
    req({ uri: '/test1', auth: { bearer: '123456' } }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.deepEqual(JSON.parse(body), { hello: 'world' })
    })
  })

  test('invalid key route fails correctly', (t) => {
    t.plan(3)
    req({ uri: '/test2', auth: { bearer: '654321' } }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 401)
      t.match(JSON.parse(body).error, /invalid authorization header/)
    })
  })

  test('missing header route fails correctly', (t) => {
    t.plan(3)
    req({ uri: '/test3' }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 401)
      t.match(JSON.parse(body).error, /missing authorization header/)
    })
  })
})
