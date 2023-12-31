import {
  FastifyRequest,
  FastifyReply,
  FastifyPluginCallback
} from 'fastify'

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
    auth?: (key: string, req: FastifyRequest) => boolean | Promise<boolean>;
    errorResponse?: (err: Error) => { error: string };
    contentType?: string;
    bearerType?: string;
    specCompliance?: 'rfc6749' | 'rfc6750';
    addHook?: boolean;
    verifyErrorLogLevel?: string;
  }

  export type verifyBearerAuth = (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => void
  export type verifyBearerAuthFactory = (options: fastifyBearerAuth.FastifyBearerAuthOptions) => verifyBearerAuth

  export const fastifyBearerAuth: FastifyBearerAuth
  export { fastifyBearerAuth as default }
}

declare function fastifyBearerAuth(...params: Parameters<FastifyBearerAuth>): ReturnType<FastifyBearerAuth>
export = fastifyBearerAuth
