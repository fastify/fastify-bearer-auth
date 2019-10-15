import * as Fastify from 'fastify';
import * as bearerAuthPlugin from '../..';

const app = Fastify();

const keys = new Set(['a-super-secret-key', 'another-super-secret-key']);

app.register(bearerAuthPlugin, { keys });

app.register(bearerAuthPlugin, {
  keys: 'secret',
  bearerType: 'Bearer',
  contentType: 'text/plain',
  errorResponse(err) {
    return { stack: err.stack };
  },
  auth(key, req) {
    return req.headers.myKey === key;
  }
});

app.get('/foo', (req, reply) => {
  reply.send({ authenticated: true });
});

app.listen({ port: 8000 }, err => {
  if (err) {
    app.log.error(err.message);
    process.exit(1);
  }
  app.log.info('http://127.0.0.1:8000/foo');
});
