// Definitions by: ricardo-devis-agullo <https://github.com/ricardo-devis-agullo>

import fastify = require('fastify');

import { Server, IncomingMessage, ServerResponse } from 'http';

declare const fastifyBearerAuth: fastify.Plugin<
  Server,
  IncomingMessage,
  ServerResponse,
  {
    keys: Set<string> | string;
    errorResponse?: (err: Error) => any;
    contentType?: string;
    bearerType?: string;
    auth?: (key: string, req: fastify.FastifyRequest) => boolean | Promise<boolean>;
  }
>;

export = fastifyBearerAuth;
