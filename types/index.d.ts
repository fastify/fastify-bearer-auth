import {
  FastifyRequest,
  FastifyReply,
  FastifyPluginCallback
} from 'fastify'
import { FastifyError } from '@fastify/error'

declare interface FastifyBearerAuthErrors {
  FST_BEARER_AUTH_INVALID_KEYS_OPTION_TYPE: FastifyError
  FST_BEARER_AUTH_INVALID_HOOK: FastifyError
  FST_BEARER_AUTH_INVALID_LOG_LEVEL: FastifyError
  FST_BEARER_AUTH_KEYS_OPTION_INVALID_KEY_TYPE: FastifyError
  FST_BEARER_AUTH_INVALID_SPEC: FastifyError
  FST_BEARER_AUTH_MISSING_AUTHORIZATION_HEADER: FastifyError
  FST_BEARER_AUTH_INVALID_AUTHORIZATION_HEADER: FastifyError
}

declare module 'fastify' {
  interface FastifyInstance {
    verifyBearerAuthFactory?: fastifyBearerAuth.verifyBearerAuthFactory
    verifyBearerAuth?: fastifyBearerAuth.verifyBearerAuth
  }
}

type FastifyBearerAuth = FastifyPluginCallback<fastifyBearerAuth.FastifyBearerAuthOptions>

declare namespace fastifyBearerAuth {
  export interface FastifyBearerAuthOptions {
    keys: Set<string> | string[];
    auth?: (key: string, req: FastifyRequest) => boolean | Promise<boolean> | undefined;
    errorResponse?: (err: Error) => unknown;
    contentType?: string | undefined;
    bearerType?: string;
    specCompliance?: 'rfc6749' | 'rfc6750';
    addHook?: boolean | 'onRequest' | 'preParsing' | undefined;
    verifyErrorLogLevel?: string;
  }

  export type verifyBearerAuth = (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => void
  export type verifyBearerAuthFactory = (options: fastifyBearerAuth.FastifyBearerAuthOptions) => verifyBearerAuth

  export const fastifyBearerAuth: FastifyBearerAuth
  export const FastifyBearerAuthErrors: FastifyBearerAuthErrors
  export { fastifyBearerAuth as default }
}

declare function fastifyBearerAuth (...params: Parameters<FastifyBearerAuth>): ReturnType<FastifyBearerAuth>
export = fastifyBearerAuth
