import fastify, { FastifyRequest } from 'fastify'
import { expectAssignable, expectType } from 'tsd'
import { default as bearerAuth, FastifyBearerAuthOptions, verifyBearerAuth, verifyBearerAuthFactory } from '..'

const pluginOptions: FastifyBearerAuthOptions = {
  keys: new Set(['foo']),
  auth: (key: string, req: FastifyRequest) => { return true },
  errorResponse: (err: Error) => { return { error: err.message } },
  contentType: '',
  bearerType: '',
  addHook: false
}

const pluginOptionsAuthPromise: FastifyBearerAuthOptions = {
  keys: new Set(['foo']),
  auth: (key: string, req: FastifyRequest) => { return Promise.resolve(true) },
  errorResponse: (err: Error) => { return { error: err.message } },
  contentType: '',
  bearerType: ''
}

expectAssignable<{
  keys: Set<string>,
  auth?: (key: string, req: FastifyRequest) => boolean | Promise<boolean>,
  errorResponse?: (err: Error) => { error: string },
  contentType?: string,
  bearerType?: string
}>(pluginOptions)

expectAssignable<{
  keys: Set<string>,
  auth?: (key: string, req: FastifyRequest) => boolean | Promise<boolean>,
  errorResponse?: (err: Error) => { error: string },
  contentType?: string,
  bearerType?: string
}>(pluginOptionsAuthPromise)

expectAssignable<{
  keys: Set<string>,
  auth?: (key: string, req: FastifyRequest) => boolean | Promise<boolean>,
  errorResponse?: (err: Error) => { error: string },
  contentType?: string,
  bearerType?: string,
  verifyErrorLogLevel? : string,
  bearerTypeCaseSensitive?: boolean;
}>(pluginOptionsAuthPromise)

fastify().register(bearerAuth, pluginOptions)
fastify().register(bearerAuth, pluginOptionsAuthPromise)

expectType<verifyBearerAuth | undefined>(fastify().verifyBearerAuth)
expectType<verifyBearerAuthFactory | undefined>(fastify().verifyBearerAuthFactory)
