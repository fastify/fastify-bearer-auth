import fastify, { FastifyRequest } from 'fastify'
import { FastifyError } from '@fastify/error'
import { expect } from 'tstyche'
import bearerAuth, {
  type FastifyBearerAuthOptions,
  type verifyBearerAuth,
  type verifyBearerAuthFactory,
  FastifyBearerAuthErrors
} from '..'

const pluginOptions: FastifyBearerAuthOptions = {
  keys: new Set(['foo']),
  auth: (_key: string, _req: FastifyRequest) => { return true },
  errorResponse: (err: Error) => { return { error: err.message } },
  contentType: '',
  bearerType: '',
  addHook: false
}

const pluginOptionsAuthPromise: FastifyBearerAuthOptions = {
  keys: new Set(['foo']),
  auth: (_key: string, _req: FastifyRequest) => { return Promise.resolve(true) },
  errorResponse: (err: Error) => { return { error: err.message } },
  contentType: '',
  bearerType: '',
  addHook: 'onRequest'
}

const pluginOptionsKeyArray: FastifyBearerAuthOptions = {
  keys: ['foo'],
  auth: (_key: string, _req: FastifyRequest) => { return Promise.resolve(true) },
  errorResponse: (err: Error) => { return { error: err.message } },
  contentType: '',
  bearerType: ''
}

const pluginOptionsUndefined: FastifyBearerAuthOptions = {
  keys: ['foo'],
  errorResponse: (err: Error) => { return { error: err.message } },
}

expect(pluginOptions).type.toBeAssignableTo<{
  keys: Set<string> | string[];
  auth?: (key: string, req: FastifyRequest) => boolean | Promise<boolean> | undefined;
  errorResponse?: (err: Error) => { error: string };
  contentType?: string | undefined;
  bearerType?: string;
}>()

expect(pluginOptionsKeyArray).type.toBeAssignableTo<{
  keys: Set<string> | string[];
  auth?: (key: string, req: FastifyRequest) => boolean | Promise<boolean> | undefined;
  errorResponse?: (err: Error) => { error: string };
  contentType?: string | undefined;
  bearerType?: string;
  addHook?: boolean | 'onRequest' | 'preParsing' | undefined;
}>()

expect(pluginOptionsUndefined).type.toBeAssignableTo<{
  keys: Set<string> | string[];
  auth?: (key: string, req: FastifyRequest) => boolean | Promise<boolean> | undefined;
  errorResponse?: (err: Error) => { error: string };
  contentType?: string | undefined;
  bearerType?: string;
  addHook?: boolean | 'onRequest' | 'preParsing' | undefined;
}>()

expect(pluginOptionsAuthPromise).type.toBeAssignableTo<{
  keys: Set<string> | string[];
  auth?: (key: string, req: FastifyRequest) => boolean | Promise<boolean> | undefined;
  errorResponse?: (err: Error) => { error: string };
  contentType?: string | undefined;
  bearerType?: string;
}>()

expect(pluginOptionsAuthPromise).type.toBeAssignableTo<{
  keys: Set<string> | string[];
  auth?: (key: string, req: FastifyRequest) => boolean | Promise<boolean> | undefined;
  errorResponse?: (err: Error) => { error: string };
  contentType?: string | undefined;
  bearerType?: string;
  specCompliance?: 'rfc6749' | 'rfc6750';
  verifyErrorLogLevel?: string;
}>()

fastify().register(bearerAuth, pluginOptions)
fastify().register(bearerAuth, pluginOptionsAuthPromise)
fastify().register(bearerAuth, pluginOptionsKeyArray)

expect(fastify().verifyBearerAuth).type.toBe<verifyBearerAuth | undefined>()
expect(fastify().verifyBearerAuthFactory).type.toBe<verifyBearerAuthFactory | undefined>()

expect(
  FastifyBearerAuthErrors.FST_BEARER_AUTH_INVALID_KEYS_OPTION_TYPE
).type.toBeAssignableTo<FastifyError>()
expect(
  FastifyBearerAuthErrors.FST_BEARER_AUTH_INVALID_HOOK
).type.toBeAssignableTo<FastifyError>()
expect(
  FastifyBearerAuthErrors.FST_BEARER_AUTH_INVALID_LOG_LEVEL
).type.toBeAssignableTo<FastifyError>()
expect(
  FastifyBearerAuthErrors.FST_BEARER_AUTH_KEYS_OPTION_INVALID_KEY_TYPE
).type.toBeAssignableTo<FastifyError>()
expect(
  FastifyBearerAuthErrors.FST_BEARER_AUTH_INVALID_SPEC
).type.toBeAssignableTo<FastifyError>()
expect(
  FastifyBearerAuthErrors.FST_BEARER_AUTH_MISSING_AUTHORIZATION_HEADER
).type.toBeAssignableTo<FastifyError>()
expect(
  FastifyBearerAuthErrors.FST_BEARER_AUTH_INVALID_AUTHORIZATION_HEADER
).type.toBeAssignableTo<FastifyError>()
