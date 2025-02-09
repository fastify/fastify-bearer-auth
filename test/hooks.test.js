'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const kFastifyContext = require('fastify/lib/symbols').kRouteContext
const plugin = require('../')

const keys = new Set(['123456'])
const authorization = 'Bearer 123456'

test('onRequest hook used by default', async (t) => {
  t.plan(9)
  const fastify = Fastify()
  fastify.register(plugin, { keys, addHook: undefined }).get('/test', (_req, res) => {
    res.send({ hello: 'world' })
  })

  fastify.addHook('onResponse', (request, _reply, done) => {
    t.assert.strictEqual(request[kFastifyContext].onError, null)
    t.assert.strictEqual(request[kFastifyContext].onRequest.length, 1)
    t.assert.strictEqual(request[kFastifyContext].onSend, null)
    t.assert.strictEqual(request[kFastifyContext].preHandler, null)
    t.assert.strictEqual(request[kFastifyContext].preParsing, null)
    t.assert.strictEqual(request[kFastifyContext].preSerialization, null)
    t.assert.strictEqual(request[kFastifyContext].preValidation, null)
    done()
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
    headers: {
      authorization
    }
  })
  t.assert.strictEqual(response.statusCode, 200)
  t.assert.deepStrictEqual(JSON.parse(response.body), { hello: 'world' })
})

test('preParsing hook used when specified', async (t) => {
  t.plan(9)
  const fastify = Fastify()
  fastify.register(plugin, { keys, addHook: 'preParsing' }).get('/test', (_req, res) => {
    res.send({ hello: 'world' })
  })

  fastify.addHook('onResponse', (request, _reply, done) => {
    t.assert.strictEqual(request[kFastifyContext].onError, null)
    t.assert.strictEqual(request[kFastifyContext].onRequest, null)
    t.assert.strictEqual(request[kFastifyContext].onSend, null)
    t.assert.strictEqual(request[kFastifyContext].preHandler, null)
    t.assert.strictEqual(request[kFastifyContext].preParsing.length, 1)
    t.assert.strictEqual(request[kFastifyContext].preSerialization, null)
    t.assert.strictEqual(request[kFastifyContext].preValidation, null)
    done()
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
    headers: {
      authorization
    }
  })
  t.assert.strictEqual(response.statusCode, 200)
  t.assert.deepStrictEqual(JSON.parse(response.body), { hello: 'world' })
})

test('onRequest hook used when specified', async (t) => {
  t.plan(9)
  const fastify = Fastify()
  fastify.register(plugin, { keys, addHook: 'onRequest' }).get('/test', (_req, res) => {
    res.send({ hello: 'world' })
  })

  fastify.addHook('onResponse', (request, _reply, done) => {
    t.assert.strictEqual(request[kFastifyContext].onError, null)
    t.assert.strictEqual(request[kFastifyContext].onRequest.length, 1)
    t.assert.strictEqual(request[kFastifyContext].onSend, null)
    t.assert.strictEqual(request[kFastifyContext].preHandler, null)
    t.assert.strictEqual(request[kFastifyContext].preParsing, null)
    t.assert.strictEqual(request[kFastifyContext].preSerialization, null)
    t.assert.strictEqual(request[kFastifyContext].preValidation, null)
    done()
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
    headers: {
      authorization
    }
  })
  t.assert.strictEqual(response.statusCode, 200)
  t.assert.deepStrictEqual(JSON.parse(response.body), { hello: 'world' })
})

test('error when invalid hook specified', async (t) => {
  t.plan(1)
  const fastify = Fastify()
  try {
    await fastify.register(plugin, { keys, addHook: 'onResponse' })
  } catch (err) {
    t.assert.strictEqual(err.message, 'options.addHook must be either "onRequest" or "preParsing"')
  }
})
