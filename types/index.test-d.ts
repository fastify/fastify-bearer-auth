import fastify, { FastifyRequest } from 'fastify'
import { expectAssignable, expectType } from 'tsd'
import bearerAuth, { FastifyBearerAuthOptions, verifyBearerAuth, verifyBearerAuthFactory } from '..'

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
  auth: undefined,
  errorResponse: (err: Error) => { return { error: err.message } },
  contentType: undefined,
  bearerType: undefined,
  addHook: undefined
}

expectAssignable<{
  keys: Set<string> | string[];
  auth?: (key: string, req: FastifyRequest) => boolean | Promise<boolean> | undefined;
  errorResponse?: (err: Error) => { error: string };
  contentType?: string | undefined;
  bearerType?: string;
}>(pluginOptions)

expectAssignable<{
  keys: Set<string> | string[];
  auth?: (key: string, req: FastifyRequest) => boolean | Promise<boolean> | undefined;
  errorResponse?: (err: Error) => { error: string };
  contentType?: string | undefined;
  bearerType?: string;
  addHook?: boolean | 'onRequest' | 'preParsing' | undefined;
}>(pluginOptionsKeyArray)

expectAssignable<{
  keys: Set<string> | string[];
  auth?: (key: string, req: FastifyRequest) => boolean | Promise<boolean> | undefined;
  errorResponse?: (err: Error) => { error: string };
  contentType?: string | undefined;
  bearerType?: string;
  addHook?: boolean | 'onRequest' | 'preParsing' | undefined;
}>(pluginOptionsUndefined)

expectAssignable<{
  keys: Set<string> | string[];
  auth?: (key: string, req: FastifyRequest) => boolean | Promise<boolean> | undefined;
  errorResponse?: (err: Error) => { error: string };
  contentType?: string | undefined;
  bearerType?: string;
}>(pluginOptionsAuthPromise)

expectAssignable<{
  keys: Set<string> | string[];
  auth?: (key: string, req: FastifyRequest) => boolean | Promise<boolean> | undefined;
  errorResponse?: (err: Error) => { error: string };
  contentType?: string | undefined;
  bearerType?: string;
  specCompliance?: 'rfc6749' | 'rfc6750';
  verifyErrorLogLevel?: string;
}>(pluginOptionsAuthPromise)

fastify().register(bearerAuth, pluginOptions)
fastify().register(bearerAuth, pluginOptionsAuthPromise)
fastify().register(bearerAuth, pluginOptionsKeyArray)

expectType<verifyBearerAuth | undefined>(fastify().verifyBearerAuth)
expectType<verifyBearerAuthFactory | undefined>(fastify().verifyBearerAuthFactory)
