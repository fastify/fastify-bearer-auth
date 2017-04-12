# fastify-bearer-auth

*fastify-bearer-auth* provides a simple request hook for the [Fastify][fastify]
web framework.

[fastify]: https://github.com/fastify/fastify

## Example

```js
'use strict'

const fastify = require('fastify')
const bearerAuthPlugin = require('fastify-bearer-auth')
const keys = new Set(['a-super-secret-key', 'another-super-secret-key'])

fastify.addHook('preHandler', bearerAuthPlugin({keys}))
fastify.get('/foo', (req, reply) => {
  reply({authenticated: true})
})

fastify.listen({port: 8000}, (err) => {
  if (err) {
    console.error(err.message)
    process.exit(1)
  }
  console.log.info('http://127.0.0.1:8000/foo')
})
```

## API

+ `factory(config)`: exported by `require('fastify-bearer-auth')`. The `config`
  object must have a `keys` property that is set to an object which has a
  `has(key)` method. It may also have method `errorResponse(err)` and property
  `contentType`. If set, the `errorResponse(err)` method must synchronously
  return the content body to be sent to the client. If the content to be sent
  is anything other than `application/json`, then the `contentType` property
  must be set. The default config object is:

  ```js
  {
    keys: new Set(),
    contentType: undefined,
    errorResponse: (err) => {
      return {error: err.message}
    }
  }
  ```

+ `bearerAuthHook(req, reply, next)`: a standard *Fastify*
  [preHandler hook][prehook] which will inspect the request's headers
  for an `authorization` header in the format `bearer key`. The `key` will be
  matched against the configured `keys` object via the `has(key)` method. If
  the `authorization` header is missing, malformed, or the `key` does not
  validate then a 401 response will be sent with a `{error: message}` body;
  no further request processing will be performed.

[prehook]: https://github.com/fastify/fastify/blob/master/docs/Hooks.md

## License

[MIT License](http://jsumners.mit-license.org/)
