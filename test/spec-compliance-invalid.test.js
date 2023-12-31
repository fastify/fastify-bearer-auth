'use strict'

const tap = require('tap')
const test = tap.test
const Fastify = require('fastify')
const plugin = require('../')
const { FST_BEARER_AUTH_INVALID_SPEC } = require('../lib/errors')

test('throws FST_BEARER_AUTH_INVALID_SPEC when invalid value for specCompliance was used', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  t.rejects(() => fastify.register(plugin, { keys: new Set(['123456']), specCompliance: 'invalid' }), new FST_BEARER_AUTH_INVALID_SPEC())
})
