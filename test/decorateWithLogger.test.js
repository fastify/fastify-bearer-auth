'use strict'

const tap = require('tap')
const test = tap.test
const fastify = require('fastify')({ logger: true })
const plugin = require('../')

fastify.register(plugin, { addHook: false, keys: new Set(['123456']) })

test('verifyBearerAuth', (t) => {
  t.plan(1)
  fastify.ready(() => {
    t.ok(fastify.verifyBearerAuth)
  })
})

test('verifyBearerAuthFactory', (t) => {
  t.plan(1)
  fastify.ready(() => {
    t.ok(fastify.verifyBearerAuthFactory)
  })
})

const fastifyLogDebug = require('fastify')({ logger: { level: 'debug' } })
fastifyLogDebug.register(plugin, { addHook: false, keys: new Set(['123456']), verifyErrorLogLevel: 'debug' })

test('verifyBearerAuth with debug log', (t) => {
  t.plan(1)
  fastifyLogDebug.ready(() => {
    t.ok(fastifyLogDebug.verifyBearerAuth)
  })
})

test('verifyBearerAuthFactory with debug log', (t) => {
  t.plan(1)
  fastifyLogDebug.ready(() => {
    t.ok(fastifyLogDebug.verifyBearerAuthFactory)
  })
})

const fastifyLogError = require('fastify')({ logger: { level: 'error' } })
test('register with invalid log level', async (t) => {
  const invalidLogLevel = 'invalid'
  t.plan(1)
  try {
    await fastifyLogError.register(plugin, { addHook: false, keys: new Set(['123456']), verifyErrorLogLevel: invalidLogLevel })
  } catch (err) {
    t.equal(err.message, `fastify.log does not have level '${invalidLogLevel}'`)
  }
})
