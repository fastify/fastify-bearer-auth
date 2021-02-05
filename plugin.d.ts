import * as fastify from 'fastify'

declare namespace fastifyBearerAuth {
	export interface FastifyBearerAuthOptions {
		keys: Set<string>,
		auth?: (key: string, req: fastify.FastifyRequest) => boolean | Promise<boolean>,
		errorResponse?: (err: Error) => { error: string },
		contentType?: string,
		bearerType?: string,
		allowAnonymous?: true
	}
	
	interface FastifyContext {
		config: {
			allowAnonymous?: boolean
		}
	}
}

declare const fastifyBearerAuth: fastify.FastifyPlugin<fastifyBearerAuth.FastifyBearerAuthOptions>

export = fastifyBearerAuth
