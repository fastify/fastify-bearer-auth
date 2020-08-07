import fastify, { FastifyRequest } from 'fastify'
import bearerAuth, { FastifyBearerAuthOptions } from '../plugin'
import { expectAssignable } from 'tsd'

const pluginOptions: FastifyBearerAuthOptions = {
	keys: new Set(['foo']),
	auth: (key: string, req: FastifyRequest) => { return true },
	errorResponse: (err: Error) => { return { error: err.message } },
	contentType: '',
	bearerType: ''
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

fastify().register(bearerAuth, pluginOptions)
fastify().register(bearerAuth, pluginOptionsAuthPromise)