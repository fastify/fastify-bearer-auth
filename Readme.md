# @fastify/bearer-auth

[![CI](https://github.com/fastify/fastify-bearer-auth/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/fastify/fastify-bearer-auth/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@fastify/bearer-auth)](https://www.npmjs.com/package/@fastify/bearer-auth)
[![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-brightgreen?style=flat)](https://github.com/neostandard/neostandard)

*@fastify/bearer-auth* provides a simple Bearer auth request hook for the [Fastify][fastify]
web framework.

[fastify]: https://fastify.dev/


## Install
```
npm i @fastify/bearer-auth
```

### Compatibility
| Plugin version | Fastify version |
| ---------------|-----------------|
| `^10.x`        | `^5.x`          |
| `^8.x`         | `^4.x`          |
| `^5.x`         | `^3.x`          |
| `^4.x`         | `^2.x`          |
| `^1.x`         | `^1.x`          |


Please note that if a Fastify version is out of support, then so are the corresponding versions of this plugin
in the table above.
See [Fastify's LTS policy](https://github.com/fastify/fastify/blob/main/docs/Reference/LTS.md) for more details.

## Example

```js
'use strict'

const fastify = require('fastify')()
const bearerAuthPlugin = require('@fastify/bearer-auth')
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

*@fastify/bearer-auth* exports a standard [Fastify plugin](https://github.com/fastify/fastify-plugin). This allows
you to register the plugin within scoped paths. Therefore, you could have some
paths not protected by the plugin and others that are. See the [Fastify](https://fastify.dev/docs/latest)
documentation and examples for more details.

When registering the plugin you must specify a configuration object:

* `keys`: A `Set` or array with valid keys of type `string` (required)
* `function errorResponse (err) {}`: method must synchronously return the content body to be
sent to the client (optional)
* `contentType`: If the content to be sent is anything other than
`application/json`, then the `contentType` property must be set (optional)
* `bearerType`: string specifying the Bearer string (optional)
* `specCompliance`:
Plugin spec compliance. Accepts either
[`rfc6749`](https://datatracker.ietf.org/doc/html/rfc6749) or
[`rfc6750`](https://datatracker.ietf.org/doc/html/rfc6750).
Defaults to `rfc6750`.
  * `rfc6749` is about the generic OAuth2.0 protocol, which allows the token type to be case-insensitive
  * `rfc6750` is about the Bearer Token Usage, which forces the token type to be an exact match
* `function auth (key, req) {}` : this function will test if `key` is a valid token.
   The function must return a literal `true` if the key is accepted or a literal
   `false` if rejected. The function may also return a promise that resolves to
   one of these values. If the function returns or resolves to any other value,
   rejects, or throws, an HTTP status of `500` will be sent. `req` is the Fastify
   request object. If `auth` is a function, `keys` will be ignored. If `auth` is
   not a function, or `undefined`, `keys` will be used.
* `addHook`: If `false`, this plugin will not register `onRequest` hook automatically,
   instead it provides two decorations `fastify.verifyBearerAuth` and
   `fastify.verifyBearerAuthFactory` for you.
* `verifyErrorLogLevel`: An optional string specifying the log level when there is a verification error.
   It must be a valid log level supported by fastify, otherwise, an exception will be thrown
   when registering the plugin. By default, this option is set to `error`.

The default configuration object is:

  ```js
  {
    keys: new Set(),
    contentType: undefined,
    bearerType: 'Bearer',
    specCompliance: 'rfc6750',
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

[fplugin]: https://github.com/fastify/fastify/blob/main/docs/Reference/Plugins.md
[prehook]: https://github.com/fastify/fastify/blob/main/docs/Reference/Hooks.md

## Integration with `@fastify/auth`

This plugin can integrate with `@fastify/auth` by following this example:

```js
const fastify = require('fastify')()
const auth = require('@fastify/auth')
const bearerAuthPlugin = require('@fastify/bearer-auth')
const keys = new Set(['a-super-secret-key', 'another-super-secret-key'])

async function server() {

  await fastify
    .register(auth)
    .register(bearerAuthPlugin, { addHook: false, keys, verifyErrorLogLevel: 'debug' })
    .decorate('allowAnonymous', function (req, reply, done) {
      if (req.headers.authorization) {
        return done(Error('not anonymous'))
      }
      return done()
    })

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

  await fastify.listen({port: 8000})
}

server()
```

By passing `{ addHook: false }` in the options, the `verifyBearerAuth` hook, instead of
immediately replying on error (`reply.send(someError)`), invokes `done(someError)`. This
will allow `fastify.auth` to continue with the next authentication scheme in the hook list.
Note that by setting `{ verifyErrorLogLevel: 'debug' }` in the options, `@fastify/bearer-auth` will emit all verification error logs at the `debug` level. Since it is not the only authentication method here, emitting verification error logs at the `error` level may be not appropriate here.
If `verifyBearerAuth` is the last hook in the list, `fastify.auth` will reply with `Unauthorized`.

## License

Licensed under [MIT](./LICENSE).
