'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const plugin = require('../')

test('throws FST_BEARER_AUTH_INVALID_SPEC when invalid value for specCompliance was used', async (t) => {
  t.plan(2)

  const fastify = Fastify()

  await t.assert.rejects(
    async () => fastify.register(plugin, { keys: new Set(['123456']), specCompliance: 'invalid' }),
    (err) => {
      t.assert.strictEqual(err.name, 'FastifyError')
      return true
    }
  )
})
