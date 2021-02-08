import * as fastify from 'fastify'

declare namespace fastifyBearerAuth {
  export interface FastifyBearerAuthOptions {
    keys: Set<string>,
    auth?: (key: string, req: fastify.FastifyRequest) => boolean | Promise<boolean>,
    errorResponse?: (err: Error) => { error: string },
    contentType?: string,
    bearerType?: string,
    addHook?: boolean
  }

  export type verifyBearerAuth = (request: fastify.FastifyRequest, reply: fastify.FastifyReply, done: (err?: Error) => void) => void
  export type verifyBearerAuthFactory = (options: fastifyBearerAuth.FastifyBearerAuthOptions) => verifyBearerAuth
}

declare module 'fastify' {
  interface FastifyInstance {
    verifyBearerAuthFactory?: fastifyBearerAuth.verifyBearerAuthFactory
    verifyBearerAuth?: fastifyBearerAuth.verifyBearerAuth
  }
}

declare const fastifyBearerAuth: fastify.FastifyPlugin<fastifyBearerAuth.FastifyBearerAuthOptions>

export = fastifyBearerAuth