'use strict'

const { test } = require('tap')
const stream = require('node:stream')
const Fastify = require('fastify')
const plugin = require('..')

test('verifyBearerAuth with debug log', async (t) => {
  t.plan(5)

  const logs = []
  const destination = new stream.Writable({
    write: function (chunk, encoding, next) {
      logs.push(JSON.parse(chunk))
      next()
    }
  })

  const fastify = Fastify({ logger: { level: 'debug', stream: destination } })
  await fastify.register(plugin, { addHook: false, keys: new Set(['123456']), verifyErrorLogLevel: 'debug' })

  fastify.get('/', {
    onRequest: [
      fastify.verifyBearerAuth
    ]
  }, async (request, reply) => {
    return { message: 'ok' }
  })

  await fastify.ready()

  t.ok(fastify.verifyBearerAuth)
  t.ok(fastify.verifyBearerAuthFactory)

  const response = await fastify.inject({
    method: 'GET',
    path: '/',
    headers: {
      authorization: 'Bearer bad key'
    }
  })

  // Debug level is equal to 20 so we search for an entry with a level of 20
  const failure = logs.find((entry) => entry.level && entry.level === 20)

  t.equal(failure.level, 20)
  t.equal(failure.msg, 'unauthorized: invalid authorization header')

  t.equal(response.statusCode, 401)
})

test('register with invalid log level', async (t) => {
  t.plan(1)

  const invalidLogLevel = 'invalid'
  const fastify = Fastify({ logger: { level: 'error' } })

  try {
    await fastify.register(plugin, { addHook: false, keys: new Set(['123456']), verifyErrorLogLevel: invalidLogLevel })
  } catch (err) {
    t.equal(err.message, `fastify.log does not have level '${invalidLogLevel}'`)
  }
})
