# fastify-bearer-auth

[![Greenkeeper badge](https://badges.greenkeeper.io/fastify/fastify-bearer-auth.svg)](https://greenkeeper.io/)

*fastify-bearer-auth* provides a simple request hook for the [Fastify][fastify]
web framework.

[fastify]: https://fastify.io/

## Example

```js
'use strict'

const fastify = require('fastify')()
const bearerAuthPlugin = require('fastify-bearer-auth')
const keys = new Set(['a-super-secret-key', 'another-super-secret-key'])

fastify.register(bearerAuthPlugin, {keys})
fastify.get('/foo', (req, reply) => {
  reply({authenticated: true})
})

fastify.listen({port: 8000}, (err) => {
  if (err) {
    fastify.log.error(err.message)
    process.exit(1)
  }
  fastify.log.info('http://127.0.0.1:8000/foo')
})
```

## API

*fastify-bearer-auth* exports a standard [Fastify plugin][fplugin]. This allows
you to register the plugin within scoped paths. Therefore, you could have some
paths that are not protected by the plugin and others that are. See the *Fastify*
documentation and examples for more details.

When registering the plugin you must specify a configuration object:

* `keys`: A `Set` or array with valid keys of type `string` (required)
* `function errorResponse (err) {}`: method must synchronously return the content body to be
sent to the client (optional)
* `contentType`: If the content to be sent is anything other than
`application/json`, then the `contentType` property must be set (optional)
* `bearerType`: string specifying the Bearer string (optional)
* `function auth (key, req) {}` : this function will test if `key` is a valid token.
   The function must return a literal `true` if the key is accepted or a literal
   `false` if rejected. The function may return also a promise that resolves to
   one of these values. If the function returns or resolves to any other value,
   rejects, or throws a HTTP status of `500` will be sent. `req` is the Fastify
   request object. If `auth` is a function, `keys` will be ignored. If `auth` is
   not a function, or `undefined`, `keys` will be used.

The default configuration object is:

  ```js
  {
    keys: new Set(),
    contentType: undefined,
    bearerType: 'Bearer',
    errorResponse: (err) => {
      return {error: err.message}
    },
    auth: undefined
  }
  ```

Internally, the plugin registers a standard *Fastify* [preHandler hook][prehook]
which will inspect the request's headers for an `authorization` header with the
format `bearer key`. The `key` will be matched against the configured `keys`
object via a [constant time alogrithm](https://en.wikipedia.org/wiki/Time_complexity#Constant_time) to prevent against [timing-attacks](https://snyk.io/blog/node-js-timing-attack-ccc-ctf/). If the `authorization` header is missing,
malformed, or the `key` does not validate then a 401 response will be sent with
a `{error: message}` body; no further request processing will be performed.

[fplugin]: https://github.com/fastify/fastify/blob/master/docs/Plugins.md
[prehook]: https://github.com/fastify/fastify/blob/master/docs/Hooks.md

## License

[MIT License](http://jsumners.mit-license.org/)
