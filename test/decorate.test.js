'use strict'

const { test } = require('node:test')
const fastify = require('fastify')()
const plugin = require('../')

fastify.register(plugin, { addHook: false, keys: new Set(['123456']) })

test('verifyBearerAuth', async (t) => {
  t.plan(1)
  await fastify.ready()
  t.assert.ok(fastify.verifyBearerAuth)
})

test('verifyBearerAuthFactory', async (t) => {
  t.plan(1)
  await fastify.ready()
  t.assert.ok(fastify.verifyBearerAuthFactory)
})

test('verifyBearerAuthFactory', async (t) => {
  t.plan(2)
  await fastify.ready()
  const keys = { keys: new Set([123456]) }
  await t.assert.rejects(
    async () => fastify.verifyBearerAuthFactory(keys),
    (err) => {
      t.assert.strictEqual(err.message, 'options.keys has to contain only string entries')
      return true
    }
  )
})
