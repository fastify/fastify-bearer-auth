'use strict'

const { test } = require('node:test')
const fastify = require('fastify')()
const plugin = require('../')

fastify.register(plugin, { keys: new Set(['123456']), specCompliance: 'rfc6749' })

fastify.get('/test', (req, res) => {
  res.send({ hello: 'world' })
})

test('bearerType starting with capital letter', async (t) => {
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

test('bearerType all lowercase', async (t) => {
  t.plan(2)

  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
    headers: {
      authorization: 'bearer 123456'
    }
  })

  t.assert.strictEqual(response.statusCode, 200)
  t.assert.deepStrictEqual(JSON.parse(response.body), { hello: 'world' })
})

test('bearerType all uppercase', async (t) => {
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
      authorization: 'bearer 987654'
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
      authorization: 'bearer123456'
    }
  })
  t.assert.strictEqual(response.statusCode, 401)
  t.assert.strictEqual(JSON.parse(response.body).error, 'invalid authorization header')
})
