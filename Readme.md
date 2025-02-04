# @fastify/bearer-auth

[![CI](https://github.com/fastify/fastify-bearer-auth/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/fastify/fastify-bearer-auth/actions/workflows/ci.yml)
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

*@fastify/bearer-auth* exports a standard [Fastify plugin](https://github.com/fastify/fastify-plugin).
This allows registering the plugin within scoped paths, so some paths can be protected
by the plugin while others are not. See the [Fastify](https://fastify.dev/docs/latest)
documentation and examples for more details.

When registering the plugin a configuration object must be specified:

* `keys`: A `Set` or array with valid keys of type `string` (required)
* `function errorResponse (err) {}`: Method must synchronously return the content body to be
sent to the client (optional)
* `contentType`: If the content to be sent is anything other than
`application/json`, then the `contentType` property must be set (optional)
* `bearerType`: String specifying the Bearer string (optional)
* `specCompliance`:
Plugin spec compliance. Accepts either
[`rfc6749`](https://datatracker.ietf.org/doc/html/rfc6749) or
[`rfc6750`](https://datatracker.ietf.org/doc/html/rfc6750).
Defaults to `rfc6750`.
  * `rfc6749` is about the generic OAuth2.0 protocol, which allows the token type to be case-insensitive
  * `rfc6750` is about the Bearer Token Usage, which forces the token type to be an exact match
* `function auth (key, req) {}` : This function tests if `key` is a valid token. It must return
  `true` if accepted or `false` if rejected. The function may also return a promise that resolves
  to one of these values. If the function returns or resolves to any other value, rejects, or throws,
  an HTTP status of `500` will be sent. `req` is the Fastify request object. If `auth` is a function,
  `keys` will be ignored. If `auth` is not a function or `undefined`, `keys` will be used
* `addHook`: If `false`, this plugin will not register any hook automatically. Instead, it provides two decorations: `fastify.verifyBearerAuth` and
  `fastify.verifyBearerAuthFactory`. If `true` or nullish, it will default to `onRequest`. You can also specify `onRequest` or `preParsing` to register the respective hook
* `addHook`: If `false`, no hook is registered automatically, and instead the `fastify.verifyBearerAuth` and `fastify.verifyBearerAuthFactory` decorators are exposed. If `true` or 
  nullish, defaults to `onRequest`. `onRequest` or `preParsing` can also be used to register the respective hook
* `verifyErrorLogLevel`: An optional string specifying the log level for verification errors.
  It must be a valid log level supported by Fastify, or an exception will be thrown when
  registering the plugin. By default, this option is set to `error`

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

The plugin registers a standard Fastify [onRequest hook][onrequesthook] to inspect the request's
headers for an `authorization` header in the format `bearer key`. The `key` is matched against
the configured `keys` object using a [constant time algorithm](https://en.wikipedia.org/wiki/Time_complexity#Constant_time)
to prevent [timing-attacks](https://snyk.io/blog/node-js-timing-attack-ccc-ctf/). If the
`authorization` header is missing, malformed, or the `key` does not validate, a 401 response
is sent with a `{error: message}` body, and no further request processing is performed.

[onrequesthook]: https://github.com/fastify/fastify/blob/main/docs/Reference/Hooks.md#onrequest

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

Passing `{ addHook: false }` in the options causes the `verifyBearerAuth` hook to invoke
`done(someError)` instead of immediately replying on error (`reply.send(someError)`). This allows
`fastify.auth` to continue with the next authentication scheme in the hook list.
Setting `{ verifyErrorLogLevel: 'debug' }` in the options makes `@fastify/bearer-auth` emit
all verification error logs at the `debug` level. If `verifyBearerAuth` is the last hook in the list,
`fastify.auth` will reply with `Unauthorized`.

## License

Licensed under [MIT](./LICENSE).
