'use strict'

const tap = require('tap')
const test = tap.test
const fastify = require('fastify')()
const plugin = require('../')

fastify.register(plugin, { keys: new Set(['123456']), allowAnonymous: true })

fastify.get('/test', (req, res) => {
  res.send({ hello: 'world' })
})

test('missing header route succeeds', (t) => {
  t.plan(2)
  fastify.inject({ method: 'GET', url: '/test' }).then(response => {
    t.strictEqual(response.statusCode, 200)
    t.deepEqual(JSON.parse(response.body), { hello: 'world' })
  }).catch(err => {
    t.error(err)
  })
})
