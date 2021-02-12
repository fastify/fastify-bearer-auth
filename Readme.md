# fastify-bearer-auth

[![npm version](https://img.shields.io/npm/v/fastify-bearer-auth)](https://www.npmjs.com/package/fastify-bearer-auth)
![](https://github.com/fastify/fastify-bearer-auth/workflows/CI%20workflow/badge.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/fastify/fastify-bearer-auth/badge.svg)](https://snyk.io/test/github/fastify/fastify-bearer-auth)
[![Coverage Status](https://coveralls.io/repos/github/fastify/fastify-bearer-auth/badge.svg?branch=master)](https://coveralls.io/github/fastify/fastify-bearer-auth?branch=master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

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
  reply.send({authenticated: true})
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
paths that are not protected by the plugin and others that are. See the [Fastify][fastify]
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
   `false` if rejected. The function may also return a promise that resolves to
   one of these values. If the function returns or resolves to any other value,
   rejects, or throws, a HTTP status of `500` will be sent. `req` is the Fastify
   request object. If `auth` is a function, `keys` will be ignored. If `auth` is
   not a function, or `undefined`, `keys` will be used.
* `addHook`: If `false`, this plugin will not register `onRequest` hook automatically,
   instead it provide two decorations `fastify.verifyBearerAuth` and
   `fastify.verifyBearerAuthFactory` for you.

The default configuration object is:

  ```js
  {
    keys: new Set(),
    contentType: undefined,
    bearerType: 'Bearer',
    errorResponse: (err) => {
      return {error: err.message}
    },
    auth: undefined,
    addHook: true
}
```

Internally, the plugin registers a standard *Fastify* [preHandler hook][prehook],
which will inspect the request's headers for an `authorization` header with the
format `bearer key`. The `key` will be matched against the configured `keys`
object via a [constant time algorithm](https://en.wikipedia.org/wiki/Time_complexity#Constant_time) to prevent against [timing-attacks](https://snyk.io/blog/node-js-timing-attack-ccc-ctf/). If the `authorization` header is missing,
malformed, or the `key` does not validate then a 401 response will be sent with
a `{error: message}` body; no further request processing will be performed.

[fplugin]: https://github.com/fastify/fastify/blob/master/docs/Plugins.md
[prehook]: https://github.com/fastify/fastify/blob/master/docs/Hooks.md

## Integration with `fastify-auth`

This plugin can integrate with `fastify-auth` by following this example:

```js
const fastify = require('fastify')()
const bearerAuthPlugin = require('fastify-bearer-auth')
const keys = new Set(['a-super-secret-key', 'another-super-secret-key'])

fastify.register(bearerAuthPlugin, { addHook: false, keys})

fastify.route({
  method: 'GET',
  url: '/multiauth',
  preHandler: fastify.auth([
    fastify.allowAnonymous,
    fastify.verifyBearerAuth
  ]),
  handler: function (_, reply) {
    reply.send({ hello: 'world' })
  }
})
```

## License

[MIT License](https://jsumners.mit-license.org/)
