'use strict'

const fastify = require('fastify')({
})
const bearerAuthPlugin = require('..')
const keys = new Set(['key'])

fastify.register(bearerAuthPlugin, { keys })
fastify.get('/foo', (req, reply) => {
  reply.send({ authenticated: true })
})

fastify.listen({ port: 8000 }, (err) => {
  if (err) {
    fastify.log.error(err.message)
    process.exit(1)
  }
  fastify.log.info('http://127.0.0.1:8000/foo')
})

// Missing Header
// autocannon http://127.0.0.1:8000/foo
// Invalid Bearer Type
// autocannon -H authorization='Beaver key' http://127.0.0.1:8000/foo
// Invalid Key
// autocannon -H authorization='Bearer invalid' http://127.0.0.1:8000/foo
// Valid Request
// autocannon -H authorization='Bearer key' http://127.0.0.1:8000/foo
